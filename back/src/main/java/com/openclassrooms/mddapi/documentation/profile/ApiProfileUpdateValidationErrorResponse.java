package com.openclassrooms.mddapi.documentation.profile;

import com.openclassrooms.mddapi.exception.BodyProblemDetail;
import com.openclassrooms.mddapi.exception.ErrorCodes;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@ApiResponse(
        responseCode = "400",
        description = "Un ou plusieurs champs sont invalides. Codes possibles :\n"
                + "- " + ErrorCodes.NAME_INVALID + " : le nom doit faire entre 1 et 255 caractères\n"
                + "- " + ErrorCodes.EMAIL_INVALID + " : l'email n'a pas un format valide\n"
                + "- " + ErrorCodes.EMAIL_TOO_LONG + " : l'email dépasse 255 caractères\n"
                + "- " + ErrorCodes.PASSWORD_TOO_SHORT + " : le nouveau mot de passe fait moins de 8 caractères\n"
                + "- " + ErrorCodes.PASSWORD_MISSING_UPPERCASE + " : le nouveau mot de passe ne contient pas de majuscule\n"
                + "- " + ErrorCodes.PASSWORD_MISSING_LOWERCASE + " : le nouveau mot de passe ne contient pas de minuscule\n"
                + "- " + ErrorCodes.PASSWORD_MISSING_DIGIT + " : le nouveau mot de passe ne contient pas de chiffre\n"
                + "- " + ErrorCodes.PASSWORD_MISSING_SPECIAL_CHAR + " : le nouveau mot de passe ne contient pas de caractère spécial (#?!@$%^&*-)\n"
                + "- " + ErrorCodes.PASSWORD_INVALID + " : le nouveau mot de passe ne respecte pas les règles attendues\n"
                + "- " + ErrorCodes.CURRENT_PASSWORD_REQUIRED + " : le mot de passe actuel est requis\n"
                + "- " + ErrorCodes.CURRENT_PASSWORD_INVALID + " : le mot de passe actuel ne correspond pas à celui enregistré",
        content = @Content(schema = @Schema(implementation = BodyProblemDetail.class))
)
public @interface ApiProfileUpdateValidationErrorResponse {
}
