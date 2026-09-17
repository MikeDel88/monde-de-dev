package com.openclassrooms.mddapi.config.security;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.assertj.core.api.Assertions.assertThat;

class CookieBearerTokenResolverTest {

    private final CookieBearerTokenResolver resolver = new CookieBearerTokenResolver();

    @Test
    void resolve_noCookies_returnsNull() {
        MockHttpServletRequest request = new MockHttpServletRequest();

        assertThat(resolver.resolve(request)).isNull();
    }

    @Test
    void resolve_noMatchingCookie_returnsNull() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("other", "value"));

        assertThat(resolver.resolve(request)).isNull();
    }

    @Test
    void resolve_matchingCookie_returnsValue() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(
                new Cookie("other", "value"),
                new Cookie(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME, "token123")
        );

        assertThat(resolver.resolve(request)).isEqualTo("token123");
    }
}
