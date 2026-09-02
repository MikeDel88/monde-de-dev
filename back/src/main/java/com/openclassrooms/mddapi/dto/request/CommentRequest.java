package com.openclassrooms.mddapi.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO utilisé lors de la création d'un commentaire.
 * @param content
 */
public record CommentRequest(
        @NotBlank(message = "CONTENT_REQUIRED")
        String content
) {
}
