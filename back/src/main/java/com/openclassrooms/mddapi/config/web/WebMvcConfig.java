package com.openclassrooms.mddapi.config.web;

import com.openclassrooms.mddapi.config.properties.ApiConfigProperties;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration MVC liée au versioning de l'API : préfixe d'URL
 * {@code /api/v{version}} appliqué aux contrôleurs applicatifs. La
 * résolution de version elle-même est entièrement pilotée par les
 * propriétés {@code spring.mvc.apiversion.*} (application.properties).
 */
@RequiredArgsConstructor
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final ApiConfigProperties apiConfigProperties;

    /**
     * Préfixe les routes des contrôleurs du package
     * {@code com.openclassrooms.mddapi.controller} avec {@code /api/v{version}}.
     * Les contrôleurs internes de springdoc (Swagger/OpenAPI) sont volontairement
     * exclus : la documentation d'API n'a pas vocation à être versionnée.
     * @param configurer le configurateur de résolution de chemin.
     */
    @Override
    public void configurePathMatch(@NonNull PathMatchConfigurer configurer) {
        configurer.addPathPrefix("/api/v" + apiConfigProperties.version(),
                HandlerTypePredicate.forBasePackage("com.openclassrooms.mddapi.controller"));
    }
}
