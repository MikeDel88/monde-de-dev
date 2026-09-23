package com.openclassrooms.mddapi.support;

import com.openclassrooms.mddapi.config.security.CookieBearerTokenResolver;
import com.openclassrooms.mddapi.config.security.JwtClaimsConstants;
import jakarta.servlet.http.Cookie;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Construit un cookie JWT valide, signé par un vrai {@link JwtEncoder}, pour
 * simuler un utilisateur authentifié dans les tests de contrôleur
 * ({@code @WebMvcTest}) comme dans les tests d'intégration ({@code @SpringBootTest}).
 */
public final class JwtCookieFactory {

    private JwtCookieFactory() {
    }

    public static Cookie accessTokenCookie(JwtEncoder jwtEncoder, Long userId) {
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
