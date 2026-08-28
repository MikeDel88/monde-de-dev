package com.openclassrooms.mddapi.dto.request;

import com.openclassrooms.mddapi.validation.ValidPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO utilisé lors d'une inscription
 * Le mot de passe doit contenir au minimum 8 caratères avec au moins 1 majuscule, minuscule, caractère spécial.
 * @param name
 * @param email
 * @param password
 */
public record RegisterRequest(

        @NotBlank(message = "NAME_REQUIRED")
        String name,

        @Email(message = "EMAIL_INVALID")
        String email,

        @NotBlank(message = "PASSWORD_REQUIRED")
        @ValidPassword
        @Schema(
                minLength = 8,
                maxLength = 255,
                description = "Doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (#?!@$%^&*-)",
                example = "Passw0rd!"
        )
        String password
) {
}
