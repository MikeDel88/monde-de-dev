package com.openclassrooms.mddapi.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propriétés des clés RSA ({@code rsa.*}) utilisées par {@code KeyConfig}
 * pour signer et vérifier les JWT.
 * @param privateKey clé RSA privée encodée en base64, utilisée pour signer les JWT.
 * @param publicKey clé RSA publique encodée en base64, utilisée pour vérifier les JWT.
 */
@ConfigurationProperties(prefix = "rsa")
public record RsaConfigProperties(
    String privateKey,
    String publicKey
) {}
