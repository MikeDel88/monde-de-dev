package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.config.properties.RateLimitConfigProperties;
import com.openclassrooms.mddapi.exception.RateLimitExceededException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RateLimiterServiceTest {

    private static final RateLimitConfigProperties.Limit LIMIT = new RateLimitConfigProperties.Limit(2, 1);

    private final RateLimiterService rateLimiterService = new RateLimiterService(new RateLimitConfigProperties(
            new RateLimitConfigProperties.Endpoint(LIMIT, LIMIT),
            new RateLimitConfigProperties.Endpoint(LIMIT, LIMIT)
    ));

    @Test
    void checkLogin_allowsRequestsUpToCapacity() {
        rateLimiterService.checkLogin("1.2.3.4", "user@mail.com");
        rateLimiterService.checkLogin("1.2.3.4", "user@mail.com");
    }

    @Test
    void checkLogin_blocksAfterIpCapacityExceeded() {
        rateLimiterService.checkLogin("1.2.3.4", "user1@mail.com");
        rateLimiterService.checkLogin("1.2.3.4", "user2@mail.com");

        assertThatThrownBy(() -> rateLimiterService.checkLogin("1.2.3.4", "user3@mail.com"))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    void checkLogin_blocksAfterAccountCapacityExceeded() {
        rateLimiterService.checkLogin("1.1.1.1", "target@mail.com");
        rateLimiterService.checkLogin("2.2.2.2", "target@mail.com");

        assertThatThrownBy(() -> rateLimiterService.checkLogin("3.3.3.3", "target@mail.com"))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    void checkLogin_normalizesAccountKey() {
        rateLimiterService.checkLogin("1.1.1.1", "  Target@Mail.com ");
        rateLimiterService.checkLogin("2.2.2.2", "target@mail.com");

        assertThatThrownBy(() -> rateLimiterService.checkLogin("3.3.3.3", "TARGET@MAIL.COM"))
                .isInstanceOf(RateLimitExceededException.class);
    }

    @Test
    void checkRegister_isIndependentFromLoginCounters() {
        rateLimiterService.checkLogin("1.2.3.4", "user@mail.com");
        rateLimiterService.checkLogin("1.2.3.4", "user@mail.com");

        rateLimiterService.checkRegister("1.2.3.4", "user@mail.com");
        rateLimiterService.checkRegister("1.2.3.4", "user@mail.com");

        assertThatThrownBy(() -> rateLimiterService.checkRegister("1.2.3.4", "user@mail.com"))
                .isInstanceOf(RateLimitExceededException.class);
    }
}
