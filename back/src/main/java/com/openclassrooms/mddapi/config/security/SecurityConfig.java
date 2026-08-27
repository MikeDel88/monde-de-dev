package com.openclassrooms.mddapi.config.security;

import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuration de la sécurité HTTP de l'API : authentification par JWT en mode
 * stateless, politique CORS et gestion des accès aux routes.
 */
@Log4j2
@Configuration
public class SecurityConfig {

    /**
     * Construit la chaîne de filtres de sécurité appliquée aux requêtes HTTP :
     * CSRF et form-login désactivés (API stateless sans cookies), sessions
     * stateless, CORS via {@link #corsConfigurationSource()}, routes publiques
     * (Swagger, /auth/register, /auth/login) et routes protégées nécessitant
     * un JWT valide, avec gestion des erreurs d'authentification et d'accès
     * refusé via les handlers dédiés.
     * @param http le builder de configuration de la sécurité HTTP.
     * @param jwtAuthenticationEntryPoint gère les erreurs d'authentification (401).
     * @param jwtAccessDeniedHandler gère les erreurs d'accès refusé (403).
     * @return SecurityFilterChain la chaîne de filtres de sécurité configurée.
     */
    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            JwtAccessDeniedHandler jwtAccessDeniedHandler
    ) {
        log.info("Security Filter Chain");
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement((session) -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authorize ->
                        authorize
                                .requestMatchers(
                                        "/v3/api-docs/**",
                                        "/swagger-ui.html",
                                        "/swagger-ui/**"
                                ).permitAll()
                                .requestMatchers("/auth/register").permitAll()
                                .requestMatchers("/auth/login").permitAll()
                                .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(Customizer.withDefaults())
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                .build();
    }

    /**
     * Fournit l'encodeur de mot de passe utilisé pour le hachage lors de
     * l'inscription et la vérification lors de la connexion.
     * @return PasswordEncoder l'encodeur BCrypt.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        log.info("password encoder");
        return new BCryptPasswordEncoder();
    }

    /**
     * Définit la politique CORS appliquée à toutes les routes : origine autorisée
     * (front Angular en local), méthodes HTTP autorisées, en-têtes autorisés et
     * envoi des credentials autorisé.
     * @return CorsConfigurationSource la configuration CORS.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("cors configuration");
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
