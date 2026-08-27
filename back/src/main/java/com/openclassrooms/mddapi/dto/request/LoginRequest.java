package com.openclassrooms.mddapi.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO utilisé lors d'un login.
 * @param emailOrName
 * @param password
 */
public record LoginRequest(
        @NotBlank
        String emailOrName,
        @NotBlank
        String password
) {
}
