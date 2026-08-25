package com.openclassrooms.mddapi.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank
        String emailOrName,
        @NotBlank
        String password
) {
}
