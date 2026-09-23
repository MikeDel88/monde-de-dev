package com.openclassrooms.mddapi.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Propriétés applicatives du rate limiting ({@code app.rate-limit.*}), utilisées
 * par {@code RateLimiterService} pour borner les tentatives de connexion et
 * d'inscription, par IP et par compte visé.
 * @param login limites appliquées à {@code POST /auth/login}.
 * @param register limites appliquées à {@code POST /auth/register}.
 */
@ConfigurationProperties(prefix = "app.rate-limit")
public record RateLimitConfigProperties(
    Endpoint login,
    Endpoint register
) {
    /**
     * @param ip limite appliquée par adresse IP source.
     * @param account limite appliquée par compte visé (email ou nom).
     */
    public record Endpoint(
        Limit ip,
        Limit account
    ) {
    }

    /**
     * Un compteur de type token-bucket : {@code capacity} requêtes autorisées,
     * intégralement rechargées toutes les {@code durationMinutes} minutes.
     * @param capacity nombre de tentatives autorisées par fenêtre.
     * @param durationMinutes durée en minutes de la fenêtre de rechargement.
     */
    public record Limit(
        @DefaultValue("10") int capacity,
        @DefaultValue("1") int durationMinutes
    ) {
    }
}
