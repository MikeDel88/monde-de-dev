package com.openclassrooms.mddapi.config.properties;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AppConfigPropertiesTest {

    @Test
    void getListOfDomains_splitsCommaSeparatedDomains() {
        AppConfigProperties properties = new AppConfigProperties(
                "http://localhost:4200,https://mdd.example.com", 7, true);

        assertThat(properties.getListOfDomains())
                .containsExactly("http://localhost:4200", "https://mdd.example.com");
    }

    @Test
    void getListOfDomains_singleDomain_returnsSingletonList() {
        AppConfigProperties properties = new AppConfigProperties("http://localhost:4200", 1, false);

        assertThat(properties.getListOfDomains()).containsExactly("http://localhost:4200");
        assertThat(properties.tokenExpiration()).isEqualTo(1);
        assertThat(properties.cookieSecure()).isFalse();
    }
}
