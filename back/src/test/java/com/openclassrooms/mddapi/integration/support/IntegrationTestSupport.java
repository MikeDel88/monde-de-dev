package com.openclassrooms.mddapi.integration.support;

import com.openclassrooms.mddapi.service.RateLimiterService;
import com.openclassrooms.mddapi.support.JwtCookieFactory;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Base commune aux tests d'intégration bout-en-bout (niveau 3, suffixe
 * {@code *IT}) : démarre le contexte Spring complet (DB réelle via le
 * docker-compose du projet, sécurité réelle) et fournit les mêmes
 * utilitaires que {@link com.openclassrooms.mddapi.controller.support.ControllerTestSupport}
 * pour rester cohérent avec le style des tests de contrôleur (niveau 2).
 * Le rate-limiting réel ({@link RateLimiterService}) est neutralisé (mock
 * no-op) pour éviter des 429 aléatoires liés à l'ordre d'exécution des tests
 * au sein d'un même contexte Spring.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTestSupport {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected JwtEncoder jwtEncoder;

    @MockitoBean
    protected RateLimiterService rateLimiterService;

    protected Cookie accessTokenCookie(Long userId) {
        return JwtCookieFactory.accessTokenCookie(jwtEncoder, userId);
    }
}
