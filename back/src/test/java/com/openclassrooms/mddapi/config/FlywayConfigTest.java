package com.openclassrooms.mddapi.config;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.flywaydb.core.api.output.CleanResult;
import org.flywaydb.core.api.output.MigrateResult;
import org.junit.jupiter.api.Test;
import org.springframework.boot.flyway.autoconfigure.FlywayConfigurationCustomizer;
import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FlywayConfigTest {

    private final FlywayConfig flywayConfig = new FlywayConfig();

    @Test
    void cleanEnabledCustomizer_disablesCleanProtection() {
        FlywayConfigurationCustomizer customizer = flywayConfig.cleanEnabledCustomizer();
        FluentConfiguration configuration = mock(FluentConfiguration.class);
        when(configuration.cleanDisabled(false)).thenReturn(configuration);

        customizer.customize(configuration);

        verify(configuration).cleanDisabled(false);
    }

    @Test
    void cleanMigrateStrategy_cleansThenMigrates() {
        FlywayMigrationStrategy strategy = flywayConfig.cleanMigrateStrategy();
        Flyway flyway = mock(Flyway.class);
        when(flyway.clean()).thenReturn(mock(CleanResult.class));
        when(flyway.migrate()).thenReturn(mock(MigrateResult.class));

        strategy.migrate(flyway);

        verify(flyway).clean();
        verify(flyway).migrate();
    }

    @Test
    void beans_areNotNull() {
        assertThat(flywayConfig.cleanEnabledCustomizer()).isNotNull();
        assertThat(flywayConfig.cleanMigrateStrategy()).isNotNull();
    }
}
