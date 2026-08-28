package com.openclassrooms.mddapi.documentation.profil;

import com.openclassrooms.mddapi.exception.BodyProblemDetail;
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
        description = "Le champ newPassword est requis et doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
        content = @Content(schema = @Schema(implementation = BodyProblemDetail.class))
)
public @interface ApiProfilUpdatePasswordValidationErrorResponse {
}
