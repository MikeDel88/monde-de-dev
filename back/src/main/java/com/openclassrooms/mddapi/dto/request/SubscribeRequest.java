package com.openclassrooms.mddapi.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO utilisé lors de l'abonnement à un thème.
 * @param topicId
 */
public record SubscribeRequest(
        @NotNull
        @Positive
        Long topicId
) {
}
