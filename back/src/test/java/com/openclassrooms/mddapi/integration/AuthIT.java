package com.openclassrooms.mddapi.integration;

import com.openclassrooms.mddapi.config.security.CookieBearerTokenResolver;
import com.openclassrooms.mddapi.integration.support.IntegrationTestSupport;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Tests d'intégration bout-en-bout du parcours d'authentification, contre une
 * vraie base MySQL (voir {@link IntegrationTestSupport}). Chaque test
 * s'exécute dans sa propre transaction, annulée à la fin (voir
 * {@code @Transactional}) : aucune donnée créée ici ne persiste d'un test à
 * l'autre.
 */
@Transactional
class AuthIT extends IntegrationTestSupport {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void register_then_login_then_getProfile_then_logout() throws Exception {
        String registerBody = """
                {"name":"Alice","email":"alice@mail.com","password":"Passw0rd!"}
                """;

        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated());

        String loginBody = """
                {"emailOrName":"alice@mail.com","password":"Passw0rd!"}
                """;

        var loginResult = mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"))
                .andReturn();

        Cookie sessionCookie = loginResult.getResponse().getCookie(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME);
        org.junit.jupiter.api.Assertions.assertNotNull(sessionCookie, "le cookie access_token doit être présent dans la réponse de login");

        mockMvc.perform(get("/profile").cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Alice"))
                .andExpect(jsonPath("$.email").value("alice@mail.com"));

        mockMvc.perform(post("/auth/logout").with(csrf()).cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    void register_emailAlreadyUsed_returns409() throws Exception {
        User existing = new User("Bob", "bob@mail.com", passwordEncoder.encode("Passw0rd!"));
        userRepository.save(existing);

        String registerBody = """
                {"name":"Bob2","email":"bob@mail.com","password":"Passw0rd!"}
                """;

        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value(com.openclassrooms.mddapi.exception.ErrorCodes.DATA_CONFLICT));
    }
}
