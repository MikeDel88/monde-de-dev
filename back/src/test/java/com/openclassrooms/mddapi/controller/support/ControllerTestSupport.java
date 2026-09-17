package com.openclassrooms.mddapi.controller.support;

import com.openclassrooms.mddapi.config.security.CookieBearerTokenResolver;
import com.openclassrooms.mddapi.config.security.JwtClaimsConstants;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

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
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(String.valueOf(userId))
                .issuer(JwtClaimsConstants.ISSUER)
                .audience(List.of(JwtClaimsConstants.AUDIENCE))
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.DAYS))
                .claim(JwtClaimsConstants.ROLE_CLAIM, "USER")
                .build();
        JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new Cookie(CookieBearerTokenResolver.ACCESS_TOKEN_COOKIE_NAME, token);
    }
}
