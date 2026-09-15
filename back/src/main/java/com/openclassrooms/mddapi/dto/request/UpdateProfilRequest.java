package com.openclassrooms.mddapi.dto.request;

import com.openclassrooms.mddapi.exception.ErrorCodes;
import com.openclassrooms.mddapi.validation.ValidPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO utilisé lors d'une mise à jour partielle du profil (name, email).
 * Un champ à null n'est pas modifié ; un champ absent ou vide est refusé.
 * Le mot de passe actuel doit être fourni et vérifié avant d'appliquer la maj du profil.
 * @param name
 * @param email
 * @param newPassword
 * @param currentPassword
 */
public record UpdateProfilRequest(

        @Size(min = 1, max = 255, message = ErrorCodes.NAME_INVALID)
        @Schema(nullable = true, minLength = 1, maxLength = 255, description = "Nouveau nom, laisser vide/absent pour ne pas le modifier", example = "John")
        String name,

        @Email(message = ErrorCodes.EMAIL_INVALID)
        @Size(max = 255, message = ErrorCodes.EMAIL_TOO_LONG)
        @Schema(nullable = true, maxLength = 255, description = "Nouvel email, laisser vide/absent pour ne pas le modifier", example = "john@example.com")
        String email,

        @ValidPassword
        @Schema(
                nullable = true,
                minLength = 8,
                maxLength = 255,
                description = "Doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (#?!@$%^&*-)",
                example = "Passw0rd!"
        )
                String newPassword,

        @NotBlank(message = ErrorCodes.CURRENT_PASSWORD_REQUIRED)
        @Schema(description = "Mot de passe actuel de l'utilisateur, requis pour confirmer le changement", example = "Passw0rd!")
        String currentPassword
) {
}
