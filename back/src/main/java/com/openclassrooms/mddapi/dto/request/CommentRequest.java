package com.openclassrooms.mddapi.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO utilisé lors de la création d'un commentaire.
 * @param content
 */
public record CommentRequest(
        @NotBlank(message = "CONTENT_REQUIRED")
        @Size(max = 65535, message = "CONTENT_TOO_LONG")
        @Schema(maxLength = 65535, example = "Merci pour cet article !")
        String content
) {
}
