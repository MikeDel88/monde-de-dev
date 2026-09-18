package com.openclassrooms.mddapi.integration;

import com.openclassrooms.mddapi.integration.support.IntegrationTestSupport;
import com.openclassrooms.mddapi.exception.ErrorCodes;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration bout-en-bout des abonnements aux topics, contre une
 * vraie base MySQL. Les topics de référence proviennent de la migration
 * Flyway {@code V6__insert_programming_topics.sql}, rejouée à chaque
 * démarrage du contexte (profil "test", voir {@code FlywayConfig}).
 */
@Transactional
class TopicIT extends IntegrationTestSupport {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TopicRepository topicRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private User user;

    @BeforeEach
    void createUser() {
        user = userRepository.save(new User("Carol", "carol@mail.com", passwordEncoder.encode("Passw0rd!")));
    }

    private Long javaTopicId() {
        return topicRepository.findAll().stream()
                .filter(topic -> "Java".equals(topic.getTitle()))
                .map(Topic::getId)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Topic 'Java' introuvable, vérifier V6__insert_programming_topics.sql"));
    }

    @Test
    void getTopics_returnsSeededTopics_allUnsubscribedForNewUser() throws Exception {
        mockMvc.perform(get("/topics").cookie(accessTokenCookie(user.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.title=='Java')].subscribed").value(org.hamcrest.Matchers.hasItem(false)));
    }

    @Test
    void subscribe_then_getTopics_reflectsSubscription() throws Exception {
        Long javaTopicId = javaTopicId();

        mockMvc.perform(post("/topics/subscribe")
                        .with(csrf())
                        .cookie(accessTokenCookie(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"topicId\":" + javaTopicId + "}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/topics").cookie(accessTokenCookie(user.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==" + javaTopicId + ")].subscribed").value(org.hamcrest.Matchers.hasItem(true)));
    }

    @Test
    void subscribe_then_unsubscribe_reversesSubscription() throws Exception {
        Long javaTopicId = javaTopicId();

        mockMvc.perform(post("/topics/subscribe")
                        .with(csrf())
                        .cookie(accessTokenCookie(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"topicId\":" + javaTopicId + "}"))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/topics/" + javaTopicId + "/subscribe")
                        .with(csrf())
                        .cookie(accessTokenCookie(user.getId())))
                .andExpect(status().isOk());

        mockMvc.perform(get("/topics").cookie(accessTokenCookie(user.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id==" + javaTopicId + ")].subscribed").value(org.hamcrest.Matchers.hasItem(false)));
    }

    @Test
    void subscribe_unknownTopic_returns404() throws Exception {
        mockMvc.perform(post("/topics/subscribe")
                        .with(csrf())
                        .cookie(accessTokenCookie(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"topicId\":999999}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value(ErrorCodes.TOPIC_NOT_FOUND));
    }
}
