package com.openclassrooms.mddapi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PostRequest(
        @NotNull(message = "TOPIC_REQUIRED")
        @Positive(message = "TOPIC_POSITIVE")
        Long topicId,
        @NotBlank(message = "TITLE_REQUIRED")
        String title,
        @NotBlank(message = "CONTENT_REQUIRED")
        String content
) {
}
