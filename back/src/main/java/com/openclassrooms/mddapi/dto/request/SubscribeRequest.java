package com.openclassrooms.mddapi.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record SubscribeRequest(
        @NotNull
        @Positive
        Long topicId
) {
}
