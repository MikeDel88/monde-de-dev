package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.config.properties.AppConfigProperties;
import com.openclassrooms.mddapi.config.security.CookieBearerTokenResolver;
import com.openclassrooms.mddapi.documentation.database.ApiDabataseConflictResponse;
import com.openclassrooms.mddapi.documentation.login.ApiInvalidCredentialsResponse;
import com.openclassrooms.mddapi.documentation.login.ApiLoginValidResponse;
import com.openclassrooms.mddapi.documentation.login.ApiLoginValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.ratelimit.ApiRateLimitExceededResponse;
import com.openclassrooms.mddapi.documentation.register.ApiRegisterValidResponse;
import com.openclassrooms.mddapi.dto.request.LoginRequest;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.documentation.register.ApiRegisterValidationErrorResponse;
import com.openclassrooms.mddapi.service.AuthService;
import com.openclassrooms.mddapi.service.RateLimiterService;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@Log4j2
@AllArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final RateLimiterService rateLimiterService;
    private final AppConfigProperties appConfigProperties;

    @SecurityRequirements()
    @ApiRegisterValidResponse
    @ApiDabataseConflictResponse
    @ApiRegisterValidationErrorResponse
    @ApiRateLimitExceededResponse
    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest registerRequest, HttpServletRequest request) {
        log.info("call /register");
        rateLimiterService.checkRegister(request.getRemoteAddr(), registerRequest.email());
        authService.register(registerRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }

    @SecurityRequirements()
    @ApiLoginValidResponse
    @ApiLoginValidationErrorResponse
    @ApiInvalidCredentialsResponse
    @ApiRateLimitExceededResponse
    @PostMapping("/login")
    public ResponseEntity<Void> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        log.info("call /login");
        rateLimiterService.checkLogin(request.getRemoteAddr(), loginRequest.emailOrName());
        String token = authService.login(loginRequest);
        ResponseCookie cookie = ResponseCookie.from(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(appConfigProperties.cookieSecure())
                .sameSite("Lax")
                .path(request.getContextPath())
                .maxAge(Duration.ofDays(appConfigProperties.tokenExpiration()))
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @SecurityRequirements()
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        log.info("call /logout");
        ResponseCookie cookie = ResponseCookie.from(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(appConfigProperties.cookieSecure())
                .sameSite("Lax")
                .path(request.getContextPath())
                .maxAge(0)
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }
}
