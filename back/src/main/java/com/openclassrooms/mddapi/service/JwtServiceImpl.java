package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.model.User;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Implémentation de {@link JwtService} : génère un JWT signé RS256 via
 * {@link JwtEncoder}, avec l'id de l'utilisateur comme subject et une
 * expiration à 30 jours.
 */
@Log4j2
@AllArgsConstructor
@Service
public class JwtServiceImpl implements JwtService {

    private final JwtEncoder jwtEncoder;

    @Override
    public String generateAccessToken(User user) {
        log.info("JWT Service : generateAccessToken");
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(String.valueOf(user.getId()))
                .issuedAt(now)
                .expiresAt(now.plus(30, ChronoUnit.DAYS))
                .build();

        JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        log.debug("JWT Service : Token de l'utilisateur {}", token);
        return token;
    }
}
