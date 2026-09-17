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
import com.openclassrooms.mddapi.exception.ErrorCodes;
import com.openclassrooms.mddapi.exception.InvalidCredentialsException;
import com.openclassrooms.mddapi.exception.RateLimitExceededException;
import com.openclassrooms.mddapi.repository.UserRepository;
import com.openclassrooms.mddapi.service.AuthService;
import com.openclassrooms.mddapi.service.RateLimiterService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.Duration;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@EnableWebSecurity
@Import({SecurityConfig.class, KeyConfig.class, CookieBearerTokenResolver.class,
        JwtAccessDeniedHandler.class, JwtAuthenticationEntryPoint.class})
@EnableConfigurationProperties({AppConfigProperties.class, RsaConfigProperties.class, RateLimitConfigProperties.class})
@ActiveProfiles("test")
class AuthControllerIT extends ControllerTestSupport {

    @MockitoBean
    private AuthService authService;
    @MockitoBean
    private RateLimiterService rateLimiterService;
    @MockitoBean
    private UserRepository userRepository;

    @Test
    void register_validRequest_returns201AndCallsService() throws Exception {
        String body = """
                {"name":"John","email":"john@mail.com","password":"Passw0rd!"}
                """;

        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        verify(rateLimiterService).checkRegister(anyString(), ArgumentMatchers.eq("john@mail.com"));
        verify(authService).register(any());
    }

    @Test
    void register_invalidBody_returns400WithFieldErrors() throws Exception {
        String body = """
                {"name":"","email":"not-an-email","password":"short"}
                """;

        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void register_rateLimitExceeded_returns429() throws Exception {
        String body = """
                {"name":"John","email":"john@mail.com","password":"Passw0rd!"}
                """;
        doThrow(new RateLimitExceededException()).when(rateLimiterService).checkRegister(anyString(), anyString());

        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.detail").value(ErrorCodes.RATE_LIMIT_EXCEEDED));
    }

    @Test
    void login_validCredentials_returns200WithCookie() throws Exception {
        ResponseCookie cookie = ResponseCookie.from(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME, "signed-token")
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ofDays(1))
                .build();
        when(authService.login(any(), anyString())).thenReturn(cookie);

        String body = """
                {"emailOrName":"john@mail.com","password":"Passw0rd!"}
                """;

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", containsString("signed-token")));
    }

    @Test
    void login_invalidCredentials_returns401() throws Exception {
        when(authService.login(any(), anyString())).thenThrow(new InvalidCredentialsException());

        String body = """
                {"emailOrName":"john@mail.com","password":"wrong"}
                """;

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value(ErrorCodes.INVALID_CREDENTIALS));
    }

    @Test
    void login_missingFields_returns400() throws Exception {
        String body = """
                {"emailOrName":"","password":""}
                """;

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void logout_returns200WithExpiredCookie() throws Exception {
        ResponseCookie cookie = ResponseCookie.from(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
        when(authService.logout(anyString())).thenReturn(cookie);

        mockMvc.perform(post("/auth/logout").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"));
    }

    @Test
    void register_withoutCsrfToken_isForbidden() throws Exception {
        String body = """
                {"name":"John","email":"john@mail.com","password":"Passw0rd!"}
                """;

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());
    }
}
