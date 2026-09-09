package com.openclassrooms.mddapi.config;

import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.springframework.boot.flyway.autoconfigure.FlywayConfigurationCustomizer;
import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * En profil test, la base doit repartir de zéro à chaque démarrage (schéma +
 * données seed comme les topics insérés par migration) : on autorise le
 * clean et on force clean+migrate à chaque lancement.
 */
@Configuration
@Profile("test")
public class FlywayConfig {

    @Bean
    public FlywayConfigurationCustomizer cleanEnabledCustomizer() {
        return (FluentConfiguration configuration) -> configuration.cleanDisabled(false);
    }

    @Bean
    public FlywayMigrationStrategy cleanMigrateStrategy() {
        return flyway -> {
            flyway.clean();
            flyway.migrate();
        };
    }
}
