package com.openclassrooms.mddapi.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * DTO utilisé lors d'une mise à jour partielle du profil (name, email).
 * Un champ à null n'est pas modifié ; un champ absent ou vide est refusé.
 * @param name
 * @param email
 */
public record UpdateProfilRequest(

        @Size(min = 1, max = 255, message = "NAME_INVALID")
        @Schema(nullable = true, minLength = 1, maxLength = 255, description = "Nouveau nom, laisser vide/absent pour ne pas le modifier", example = "John")
        String name,

        @Email(message = "EMAIL_INVALID")
        @Size(max = 255, message = "EMAIL_TOO_LONG")
        @Schema(nullable = true, maxLength = 255, description = "Nouvel email, laisser vide/absent pour ne pas le modifier", example = "john@example.com")
        String email
) {
}
