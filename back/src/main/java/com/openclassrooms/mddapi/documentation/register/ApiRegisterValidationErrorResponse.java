package com.openclassrooms.mddapi.documentation.register;

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
        description = "Un ou plusieurs champs sont invalides. Codes possibles : "
                + "NAME_REQUIRED, " +
                "EMAIL_INVALID, " +
                "PASSWORD_REQUIRED, " +
                "PASSWORD_TOO_SHORT, "
                + "PASSWORD_MISSING_UPPERCASE, " +
                "PASSWORD_MISSING_LOWERCASE, " +
                "PASSWORD_MISSING_DIGIT, "
                + "PASSWORD_MISSING_SPECIAL_CHAR",
        content = @Content(schema = @Schema(implementation = BodyProblemDetail.class))
)
public @interface ApiRegisterValidationErrorResponse {
}
