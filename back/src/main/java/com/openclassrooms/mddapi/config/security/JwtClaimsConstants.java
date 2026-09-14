package com.openclassrooms.mddapi.config.security;

/**
 * Valeurs des claims {@code iss}/{@code aud}/{@code role} communes à
 * l'émission ({@link com.openclassrooms.mddapi.service.JwtServiceImpl}) et à
 * la validation ({@link KeyConfig}) des JWT.
 */
public final class JwtClaimsConstants {

    public static final String ISSUER = "mdd-api";
    public static final String AUDIENCE = "mdd-api";
    public static final String ROLE_CLAIM = "role";

    private JwtClaimsConstants() {
    }
}
