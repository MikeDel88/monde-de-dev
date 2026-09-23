package com.openclassrooms.mddapi.dto.request;

import com.openclassrooms.mddapi.exception.ErrorCodes;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO utilisé lors d'un login.
 * @param emailOrName
 * @param password
 */
public record LoginRequest(
        @NotBlank(message = ErrorCodes.EMAIL_OR_NAME_REQUIRED)
        String emailOrName,
        @NotBlank(message = ErrorCodes.PASSWORD_REQUIRED)
        String password
) {
}
