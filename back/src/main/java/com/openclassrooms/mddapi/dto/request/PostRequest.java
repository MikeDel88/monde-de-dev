package com.openclassrooms.mddapi.dto.request;

import com.openclassrooms.mddapi.exception.ErrorCodes;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotNull(message = ErrorCodes.TOPIC_REQUIRED)
        @Positive(message = ErrorCodes.TOPIC_POSITIVE)
        Long topicId,
        @NotBlank(message = ErrorCodes.TITLE_REQUIRED)
        @Size(max = 255, message = ErrorCodes.TITLE_TOO_LONG)
        @Schema(maxLength = 255, example = "Découverte de Spring Boot")
        String title,
        @NotBlank(message = ErrorCodes.CONTENT_REQUIRED)
        @Size(max = 65535, message = ErrorCodes.CONTENT_TOO_LONG)
        @Schema(maxLength = 65535, example = "Dans cet article, nous allons voir comment...")
        String content
) {
}
