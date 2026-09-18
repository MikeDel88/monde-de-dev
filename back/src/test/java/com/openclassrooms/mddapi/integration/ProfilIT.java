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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration bout-en-bout du profil utilisateur, contre une vraie
 * base MySQL : sérialisation du tri des topics et round-trip réel du hachage
 * BCrypt lors d'un changement de mot de passe.
 */
@Transactional
class ProfilIT extends IntegrationTestSupport {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TopicRepository topicRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private User user;

    @BeforeEach
    void createUser() {
        user = new User("Frank", "frank@mail.com", passwordEncoder.encode("Passw0rd!"));
        Topic reactTopic = topicRepository.findAll().stream().filter(t -> "React".equals(t.getTitle())).findFirst().orElseThrow();
        Topic angularTopic = topicRepository.findAll().stream().filter(t -> "Angular".equals(t.getTitle())).findFirst().orElseThrow();
        user.subscribeTo(reactTopic);
        user.subscribeTo(angularTopic);
        userRepository.save(user);
    }

    @Test
    void getProfile_returnsTopicsSortedAlphabetically() throws Exception {
        mockMvc.perform(get("/profile").cookie(accessTokenCookie(user.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topics[0].title").value("Angular"))
                .andExpect(jsonPath("$.topics[1].title").value("React"));
    }

    @Test
    void patchProfile_changingPassword_then_loginWithNewPassword() throws Exception {
        String patchBody = """
                {"name":"Franklin","email":"franklin@mail.com","newPassword":"NewPassw0rd!","currentPassword":"Passw0rd!"}
                """;

        mockMvc.perform(patch("/profile")
                        .with(csrf())
                        .cookie(accessTokenCookie(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Franklin"));

        String loginBody = """
                {"emailOrName":"franklin@mail.com","password":"NewPassw0rd!"}
                """;

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk());
    }

    @Test
    void patchProfile_wrongCurrentPassword_returns400() throws Exception {
        String patchBody = """
                {"name":"Franklin","currentPassword":"wrongPassword"}
                """;

        mockMvc.perform(patch("/profile")
                        .with(csrf())
                        .cookie(accessTokenCookie(user.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].code").value(ErrorCodes.CURRENT_PASSWORD_INVALID));
    }
}
