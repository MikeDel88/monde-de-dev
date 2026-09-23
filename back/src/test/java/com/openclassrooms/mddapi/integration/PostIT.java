package com.openclassrooms.mddapi.integration;

import com.openclassrooms.mddapi.exception.ErrorCodes;
import com.openclassrooms.mddapi.integration.support.IntegrationTestSupport;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration bout-en-bout du fil d'actualité et des posts, contre
 * une vraie base MySQL.
 */
@Transactional
class PostIT extends IntegrationTestSupport {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TopicRepository topicRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private User subscribedUser;
    private Topic javaTopic;
    private Topic pythonTopic;

    @BeforeEach
    void createFixtures() {
        javaTopic = topicRepository.findAll().stream()
                .filter(t -> "Java".equals(t.getTitle()))
                .findFirst()
                .orElseThrow();
        pythonTopic = topicRepository.findAll().stream()
                .filter(t -> "Python".equals(t.getTitle()))
                .findFirst()
                .orElseThrow();

        subscribedUser = new User("Dave", "dave@mail.com", passwordEncoder.encode("Passw0rd!"));
        subscribedUser.subscribeTo(javaTopic);
        userRepository.save(subscribedUser);
    }

    @Test
    void createPost_then_feed_then_detail_then_comment_fullFlow() throws Exception {
        String createPostBody = """
                {"topicId":%d,"title":"Découverte de Spring Boot","content":"Un article sur Spring Boot"}
                """.formatted(javaTopic.getId());

        mockMvc.perform(post("/posts")
                        .with(csrf())
                        .cookie(accessTokenCookie(subscribedUser.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPostBody))
                .andExpect(status().isCreated());

        var feedResult = mockMvc.perform(get("/posts").cookie(accessTokenCookie(subscribedUser.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Découverte de Spring Boot"))
                .andReturn();

        long postId = com.jayway.jsonpath.JsonPath.parse(feedResult.getResponse().getContentAsString())
                .read("$.content[0].id", Long.class);

        mockMvc.perform(get("/posts/" + postId).cookie(accessTokenCookie(subscribedUser.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Découverte de Spring Boot"))
                .andExpect(jsonPath("$.comments").isEmpty());

        String commentBody = """
                {"content":"Merci pour cet article !"}
                """;
        mockMvc.perform(post("/posts/" + postId + "/comments")
                        .with(csrf())
                        .cookie(accessTokenCookie(subscribedUser.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(commentBody))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/posts/" + postId).cookie(accessTokenCookie(subscribedUser.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comments[0].content").value("Merci pour cet article !"));
    }

    @Test
    void createPost_notSubscribedToTopic_returns403() throws Exception {
        String createPostBody = """
                {"topicId":%d,"title":"Titre","content":"Contenu"}
                """.formatted(pythonTopic.getId());

        mockMvc.perform(post("/posts")
                        .with(csrf())
                        .cookie(accessTokenCookie(subscribedUser.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPostBody))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value(ErrorCodes.TOPIC_NOT_SUBSCRIBED));
    }

    @Test
    void getPost_topicNotSubscribed_returns403() throws Exception {
        User pythonAuthor = new User("Eve", "eve@mail.com", passwordEncoder.encode("Passw0rd!"));
        pythonAuthor.subscribeTo(pythonTopic);
        userRepository.save(pythonAuthor);

        String createPostBody = """
                {"topicId":%d,"title":"Titre Python","content":"Contenu Python"}
                """.formatted(pythonTopic.getId());
        mockMvc.perform(post("/posts")
                        .with(csrf())
                        .cookie(accessTokenCookie(pythonAuthor.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPostBody))
                .andExpect(status().isCreated());

        var feedResult = mockMvc.perform(get("/posts").cookie(accessTokenCookie(pythonAuthor.getId())))
                .andExpect(status().isOk())
                .andReturn();
        long pythonPostId = com.jayway.jsonpath.JsonPath.parse(feedResult.getResponse().getContentAsString())
                .read("$.content[0].id", Long.class);

        // subscribedUser n'est abonné qu'à Java : accéder à un post Python doit
        // échouer via la vraie requête JPA findByIdAndTopicIn, pas mockable de
        // façon significative en niveau 2.
        mockMvc.perform(get("/posts/" + pythonPostId).cookie(accessTokenCookie(subscribedUser.getId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value(ErrorCodes.TOPIC_NOT_SUBSCRIBED));
    }
}
