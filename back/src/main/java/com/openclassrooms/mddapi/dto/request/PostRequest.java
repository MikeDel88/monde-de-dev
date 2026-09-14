package com.openclassrooms.mddapi.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotNull(message = "TOPIC_REQUIRED")
        @Positive(message = "TOPIC_POSITIVE")
        Long topicId,
        @NotBlank(message = "TITLE_REQUIRED")
        @Size(max = 255, message = "TITLE_TOO_LONG")
        @Schema(maxLength = 255, example = "Découverte de Spring Boot")
        String title,
        @NotBlank(message = "CONTENT_REQUIRED")
        @Size(max = 65535, message = "CONTENT_TOO_LONG")
        @Schema(maxLength = 65535, example = "Dans cet article, nous allons voir comment...")
        String content
) {
}
