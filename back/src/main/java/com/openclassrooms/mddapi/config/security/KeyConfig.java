package com.openclassrooms.mddapi.config.security;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.security.KeyFactory;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.UUID;

/**
 * Charge la paire de clés RSA fixe utilisée pour signer/vérifier les JWT oauth2.
 */
@Log4j2
@Configuration
public class KeyConfig {

    /**
     * Génère une clé RSA Private key
     * @param encodedKey clé encodé en base64 dans les variables d'environnement.
     * @return RSAPrivateKey la clé générée.
     * @throws Exception en cas d'erreur sur le décodage ou la génération de la clé.
     */
    @Bean
    public RSAPrivateKey privateKey(@Value("${rsa.private-key}") String encodedKey) throws Exception {
        log.info("Loading RSA private key");
        byte[] decoded = Base64.getDecoder().decode(encodedKey);
        return (RSAPrivateKey) KeyFactory.getInstance("RSA")
                .generatePrivate(new PKCS8EncodedKeySpec(decoded));
    }

    /**
     * Génère une clé RSA Public key
     * @param encodedKey clé encodé en base64 dans les variables d'environnement.
     * @return RSAPrivateKey la clé générée.
     * @throws Exception en cas d'erreur sur le décodage ou la génération de la clé.
     */
    @Bean
    public RSAPublicKey publicKey(@Value("${rsa.public-key}") String encodedKey) throws Exception {
        log.info("Loading RSA public key");
        byte[] decoded = Base64.getDecoder().decode(encodedKey);
        return (RSAPublicKey) KeyFactory.getInstance("RSA")
                .generatePublic(new X509EncodedKeySpec(decoded));
    }

    /**
     * Vérifie la signature des JWT entrants lors de l'authentification.
     * @param publicKey clé publique.
     * @return JwtDecoder la configuration du NimbusJwtDecoder
     */
    @Bean
    public JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
        log.info("Creating JWT Decoder");
        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }

    /**
     * Signe et génère un JWT.
     * @param publicKey clé publique
     * @param privateKey clé privée
     * @return JwtEncoder qui sera utilisé pour généré le token.
     */
    @Bean
    public JwtEncoder jwtEncoder(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
        log.info("Creating JWT Encoder");
        JWK jwk = new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID(UUID.randomUUID().toString())
                .build();
        JWKSource<SecurityContext> jwkSource = new ImmutableJWKSet<>(new JWKSet(jwk));
        return new NimbusJwtEncoder(jwkSource);
    }
}
