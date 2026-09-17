package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.config.properties.AppConfigProperties;
import com.openclassrooms.mddapi.config.properties.RateLimitConfigProperties;
import com.openclassrooms.mddapi.config.properties.RsaConfigProperties;
import com.openclassrooms.mddapi.config.security.CookieBearerTokenResolver;
import com.openclassrooms.mddapi.config.security.JwtAccessDeniedHandler;
import com.openclassrooms.mddapi.config.security.JwtAuthenticationEntryPoint;
import com.openclassrooms.mddapi.config.security.KeyConfig;
import com.openclassrooms.mddapi.config.security.SecurityConfig;
import com.openclassrooms.mddapi.controller.support.ControllerTestSupport;
import com.openclassrooms.mddapi.dto.response.ProfileResponse;
import com.openclassrooms.mddapi.exception.ErrorCodes;
import com.openclassrooms.mddapi.exception.InvalidCurrentPasswordException;
import com.openclassrooms.mddapi.repository.UserRepository;
import com.openclassrooms.mddapi.service.ProfilService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProfilController.class)
@EnableWebSecurity
@Import({SecurityConfig.class, KeyConfig.class, CookieBearerTokenResolver.class,
        JwtAccessDeniedHandler.class, JwtAuthenticationEntryPoint.class})
@EnableConfigurationProperties({AppConfigProperties.class, RsaConfigProperties.class, RateLimitConfigProperties.class})
@ActiveProfiles("test")
class ProfilControllerIT extends ControllerTestSupport {

    @MockitoBean
    private ProfilService profilService;
    @MockitoBean
    private UserRepository userRepository;

    @Test
    void profile_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void profile_authenticated_returnsProfile() throws Exception {
        when(profilService.getProfil(7L)).thenReturn(new ProfileResponse("john", "john@mail.com", List.of()));

        mockMvc.perform(get("/profile").cookie(accessTokenCookie(7L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("john"))
                .andExpect(jsonPath("$.email").value("john@mail.com"));
    }

    @Test
    void patch_validRequest_returnsUpdatedProfile() throws Exception {
        when(profilService.updateProfil(eq(7L), any())).thenReturn(new ProfileResponse("New Name", "john@mail.com", List.of()));

        String body = """
                {"name":"New Name","currentPassword":"Passw0rd!"}
                """;

        mockMvc.perform(patch("/profile")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"));
    }

    @Test
    void patch_missingCurrentPassword_returns400() throws Exception {
        String body = """
                {"name":"New Name"}
                """;

        mockMvc.perform(patch("/profile")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void patch_invalidCurrentPassword_returns400WithFieldError() throws Exception {
        when(profilService.updateProfil(eq(7L), any())).thenThrow(new InvalidCurrentPasswordException());

        String body = """
                {"currentPassword":"wrong"}
                """;

        mockMvc.perform(patch("/profile")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].code").value(ErrorCodes.CURRENT_PASSWORD_INVALID));
    }
}
