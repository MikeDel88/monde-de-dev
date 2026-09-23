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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
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
class AuthControllerTest extends ControllerTestSupport {

    @MockitoBean
    private AuthService authService;
    @MockitoBean
    private RateLimiterService rateLimiterService;
    @MockitoBean
    private UserRepository userRepository;

    private static String registerBody(String name, String email, String password) {
        return """
                {"name":"%s","email":"%s","password":"%s"}
                """.formatted(name, email, password);
    }

    @Test
    void register_validRequest_returns201AndCallsService() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("John", "john@mail.com", "Passw0rd!")))
                .andExpect(status().isCreated());

        verify(rateLimiterService).checkRegister(anyString(), ArgumentMatchers.eq("john@mail.com"));
        verify(authService).register(any());
    }

    @Test
    void register_invalidBody_returns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("", "not-an-email", "short")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors").isArray());
    }

    @Test
    void register_blankName_returns400WithNameRequired() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("", "john@mail.com", "Passw0rd!")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='name')].code").value(ErrorCodes.NAME_REQUIRED));
    }

    @Test
    void register_nameTooLong_returns400WithNameTooLong() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("a".repeat(256), "john@mail.com", "Passw0rd!")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='name')].code").value(ErrorCodes.NAME_TOO_LONG));
    }

    @Test
    void register_nameAtMaxLength_returns201() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("a".repeat(255), "john@mail.com", "Passw0rd!")))
                .andExpect(status().isCreated());
    }

    @ParameterizedTest
    @CsvSource({
            "not-an-email",
            "missingdomain@",
            "a@@b.com",
            "'a b@c.com'"
    })
    void register_invalidEmailFormat_returns400WithEmailInvalid(String invalidEmail) throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("John", invalidEmail, "Passw0rd!")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='email')].code").value(ErrorCodes.EMAIL_INVALID));
    }

    @Test
    void register_emailTooLong_returns400WithEmailTooLong() throws Exception {
        // Un local-part aussi long viole à la fois @Size (EMAIL_TOO_LONG) et le
        // format @Email (EMAIL_INVALID) chez Hibernate Validator ; on vérifie
        // seulement la présence du code qui nous intéresse ici.
        String longEmail = "a".repeat(250) + "@b.com";
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("John", longEmail, "Passw0rd!")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='email')].code").value(org.hamcrest.Matchers.hasItem(ErrorCodes.EMAIL_TOO_LONG)));
    }

    @Test
    void register_blankEmail_returns400WithEmailRequired() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("John", "", "Passw0rd!")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='email')].code").value(ErrorCodes.EMAIL_REQUIRED));
    }

    @ParameterizedTest
    @MethodSource("com.openclassrooms.mddapi.controller.support.PasswordCases#invalidPasswords")
    void register_invalidPassword_returns400WithExpectedCode(String password, String expectedCode) throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("John", "john@mail.com", password)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='password')].code").value(org.hamcrest.Matchers.hasItem(expectedCode)));
    }

    @Test
    void register_malformedJson_returns400WithoutFieldErrors() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"John\","))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(ErrorCodes.MALFORMED_JSON))
                .andExpect(jsonPath("$.errors").doesNotExist());
    }

    @Test
    void register_rateLimitExceeded_returns429() throws Exception {
        doThrow(new RateLimitExceededException()).when(rateLimiterService).checkRegister(anyString(), anyString());

        mockMvc.perform(post("/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("John", "john@mail.com", "Passw0rd!")))
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
    void login_blankEmailOrName_returns400WithEmailOrNameRequired() throws Exception {
        String body = """
                {"emailOrName":"","password":"Passw0rd!"}
                """;

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='emailOrName')].code").value(ErrorCodes.EMAIL_OR_NAME_REQUIRED));
    }

    @Test
    void login_blankPassword_returns400WithPasswordRequired() throws Exception {
        String body = """
                {"emailOrName":"john@mail.com","password":""}
                """;

        mockMvc.perform(post("/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='password')].code").value(ErrorCodes.PASSWORD_REQUIRED));
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
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("John", "john@mail.com", "Passw0rd!")))
                .andExpect(status().isForbidden());
    }
}
