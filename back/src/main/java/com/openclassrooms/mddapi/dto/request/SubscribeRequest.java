package com.openclassrooms.mddapi.dto.request;

import jakarta.validation.constraints.Positive;

public record SubscribeRequest(
        @Positive
        Long topicId
) {
}
