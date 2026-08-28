package com.openclassrooms.mddapi.dto.request;

import com.openclassrooms.mddapi.validation.ValidPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO utilisé lors du changement de mot de passe du profil connecté.
 * Le mot de passe actuel doit être fourni et vérifié avant d'appliquer le nouveau.
 * @param newPassword
 * @param currentPassword
 */
public record UpdateProfilPasswordRequest(

        @NotBlank(message = "PASSWORD_REQUIRED")
        @ValidPassword
        @Schema(
                minLength = 8,
                maxLength = 255,
                description = "Doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (#?!@$%^&*-)",
                example = "Passw0rd!"
        )
        String newPassword,

        @NotBlank(message = "CURRENT_PASSWORD_REQUIRED")
        @Schema(description = "Mot de passe actuel de l'utilisateur, requis pour confirmer le changement", example = "Passw0rd!")
        String currentPassword
) {
}
