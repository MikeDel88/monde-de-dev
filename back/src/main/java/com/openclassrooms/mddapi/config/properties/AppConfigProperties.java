package com.openclassrooms.mddapi.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.Name;

import java.util.List;

/**
 * Propriétés applicatives générales ({@code app.*}), utilisées par
 * {@code SecurityConfig} pour la configuration CORS.
 * @param domains liste brute des domaines autorisés (séparés par des
 *                virgules), liée à la propriété {@code app.domains.allows}.
 */
@ConfigurationProperties(prefix = "app")
public record AppConfigProperties(
    @Name("domains.allows") String domains
) {
    /**
     * @return la liste des domaines autorisés pour CORS, obtenue en
     *         découpant {@link #domains} sur la virgule.
     */
    public List<String> getListOfDomains() {
        return List.of(this.domains.split(","));
    }
}
