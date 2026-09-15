package com.openclassrooms.mddapi.documentation.register;

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
                + "- " + ErrorCodes.NAME_REQUIRED + " : le nom est requis\n"
                + "- " + ErrorCodes.NAME_TOO_LONG + " : le nom dépasse 255 caractères\n"
                + "- " + ErrorCodes.EMAIL_REQUIRED + " : l'email est requis\n"
                + "- " + ErrorCodes.EMAIL_INVALID + " : l'email n'a pas un format valide\n"
                + "- " + ErrorCodes.EMAIL_TOO_LONG + " : l'email dépasse 255 caractères\n"
                + "- " + ErrorCodes.PASSWORD_REQUIRED + " : le mot de passe est requis\n"
                + "- " + ErrorCodes.PASSWORD_TOO_SHORT + " : le mot de passe fait moins de 8 caractères\n"
                + "- " + ErrorCodes.PASSWORD_MISSING_UPPERCASE + " : le mot de passe ne contient pas de majuscule\n"
                + "- " + ErrorCodes.PASSWORD_MISSING_LOWERCASE + " : le mot de passe ne contient pas de minuscule\n"
                + "- " + ErrorCodes.PASSWORD_MISSING_DIGIT + " : le mot de passe ne contient pas de chiffre\n"
                + "- " + ErrorCodes.PASSWORD_MISSING_SPECIAL_CHAR + " : le mot de passe ne contient pas de caractère spécial (#?!@$%^&*-)",
        content = @Content(schema = @Schema(implementation = BodyProblemDetail.class))
)
public @interface ApiRegisterValidationErrorResponse {
}
