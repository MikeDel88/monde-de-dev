package com.openclassrooms.mddapi.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.Name;

/**
 * Propriétés de versioning d'API ({@code spring.mvc.apiversion.*}), utilisées
 * pour construire le préfixe d'URL ({@code WebMvcConfig}) et les routes
 * publiques ({@code SecurityConfig}).
 * @param version version d'API par défaut (ex. "1"), liée à la propriété
 *                {@code spring.mvc.apiversion.default} via {@link Name}
 *                car {@code default} est un mot réservé Java.
 */
@ConfigurationProperties(prefix = "spring.mvc.apiversion")
public record ApiConfigProperties(
    @Name("default") String version
) {}
