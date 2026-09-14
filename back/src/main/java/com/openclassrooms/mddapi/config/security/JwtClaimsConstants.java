package com.openclassrooms.mddapi.config.security;

/**
 * Valeurs des claims {@code iss}/{@code aud}/{@code role} communes à
 * l'émission ({@link com.openclassrooms.mddapi.service.JwtServiceImpl}) et à
 * la validation ({@link KeyConfig}) des JWT.
 */
public final class JwtClaimsConstants {

    /** Claim standard {@code iss} : identifie qui a émis le token (ici, cette API). */
    public static final String ISSUER = "mdd-api";

    /** Claim standard {@code aud} : identifie pour quelle ressource le token est destiné (ici, cette API, seule à consommer ses propres tokens). */
    public static final String AUDIENCE = "mdd-api";

    /** Nom du claim personnalisé (non standard OAuth2) portant le rôle applicatif de l'utilisateur, utilisé pour construire les autorités Spring Security ({@code ROLE_*}). */
    public static final String ROLE_CLAIM = "role";

    private JwtClaimsConstants() {
    }
}
