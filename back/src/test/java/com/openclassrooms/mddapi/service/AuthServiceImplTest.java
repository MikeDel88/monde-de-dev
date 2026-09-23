package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.config.properties.AppConfigProperties;
import com.openclassrooms.mddapi.config.security.AuthenticatedUser;
import com.openclassrooms.mddapi.config.security.CookieBearerTokenResolver;
import com.openclassrooms.mddapi.dto.request.LoginRequest;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.mapper.UserMapper;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    private AppConfigProperties appConfigProperties;

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() throws Exception {
        appConfigProperties = new AppConfigProperties("http://localhost:4200", 7, true);
        Field field = AuthServiceImpl.class.getDeclaredField("appConfigProperties");
        field.setAccessible(true);
        field.set(authService, appConfigProperties);
    }

    private User newUser(Long id) throws Exception {
        User user = new User("john", "john@mail.com", "hashed");
        Field idField = user.getClass().getSuperclass().getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(user, id);
        return user;
    }

    @Test
    void register_savesMappedUser() {
        RegisterRequest request = new RegisterRequest("John", "john@mail.com", "Passw0rd!");
        User mappedUser = new User("John", "john@mail.com", "hashed");
        when(userMapper.toUser(request, passwordEncoder)).thenReturn(mappedUser);

        authService.register(request);

        verify(userRepository).save(mappedUser);
    }

    @Test
    void login_authenticatesAndReturnsCookieWithToken() throws Exception {
        LoginRequest request = new LoginRequest(" john@mail.com ", "Passw0rd!");
        User user = newUser(42L);
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(authenticatedUser, null);

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtService.generateAccessToken(user)).thenReturn("token123");

        ResponseCookie cookie = authService.login(request, "/api/v1");

        assertThat(cookie.getName()).isEqualTo(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME);
        assertThat(cookie.getValue()).isEqualTo("token123");
        assertThat(cookie.getPath()).isEqualTo("/api/v1");
        assertThat(cookie.isHttpOnly()).isTrue();
        assertThat(cookie.isSecure()).isTrue();
        assertThat(cookie.getMaxAge().toDays()).isEqualTo(7);
    }

    @Test
    void logout_returnsExpiredCookie() {
        ResponseCookie cookie = authService.logout("/api/v1");

        assertThat(cookie.getName()).isEqualTo(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME);
        assertThat(cookie.getValue()).isEmpty();
        assertThat(cookie.getMaxAge().isZero()).isTrue();
    }
}
