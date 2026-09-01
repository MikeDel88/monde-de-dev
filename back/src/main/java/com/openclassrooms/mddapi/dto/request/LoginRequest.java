package com.openclassrooms.mddapi.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO utilisé lors d'un login.
 * @param emailOrName
 * @param password
 */
public record LoginRequest(
        @NotBlank(message = "EMAIL_OR_NAME_REQUIRED")
        String emailOrName,
        @NotBlank(message = "PASSWORD_REQUIRED")
        String password
) {
}
