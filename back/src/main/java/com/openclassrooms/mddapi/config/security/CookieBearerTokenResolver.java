package com.openclassrooms.mddapi.config.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Résout le JWT à partir du cookie {@code access_token} plutôt que du header
 * {@code Authorization}, désormais que le token est transporté par un cookie
 * {@code HttpOnly}.
 */
@Component
public class CookieBearerTokenResolver implements BearerTokenResolver {

    public static final String ACCESS_TOKEN_COOKIE_NAME = "access_token";

    @Override
    public String resolve(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        return Arrays.stream(cookies)
                .filter(cookie -> ACCESS_TOKEN_COOKIE_NAME.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
