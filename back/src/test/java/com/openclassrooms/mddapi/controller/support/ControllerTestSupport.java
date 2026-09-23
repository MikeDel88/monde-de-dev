package com.openclassrooms.mddapi.controller.support;

import com.openclassrooms.mddapi.support.JwtCookieFactory;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Base commune aux tests d'intégration de contrôleurs (@WebMvcTest) : fournit
 * un cookie JWT valide, signé par le vrai JwtEncoder de la configuration de
 * sécurité, pour simuler un utilisateur authentifié.
 */
public abstract class ControllerTestSupport {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected JwtEncoder jwtEncoder;

    protected Cookie accessTokenCookie(Long userId) {
        return JwtCookieFactory.accessTokenCookie(jwtEncoder, userId);
    }
}
