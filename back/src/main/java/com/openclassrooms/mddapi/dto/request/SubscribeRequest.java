package com.openclassrooms.mddapi.dto.request;

import com.openclassrooms.mddapi.exception.ErrorCodes;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO utilisé lors de l'abonnement à un thème.
 * @param topicId
 */
public record SubscribeRequest(
        @NotNull(message = ErrorCodes.TOPIC_REQUIRED)
        @Positive(message = ErrorCodes.TOPIC_POSITIVE)
        Long topicId
) {
}
