package com.openclassrooms.mddapi.documentation.post;

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
        description = "Un ou plusieurs paramètres sont invalides. Codes possibles :\n"
                + "- " + ErrorCodes.CURSOR_POSITIVE + " : le cursor doit être un nombre positif\n"
                + "- " + ErrorCodes.DIRECTION_INVALID + " : la direction doit valoir asc ou desc",
        content = @Content(schema = @Schema(implementation = BodyProblemDetail.class))
)
public @interface ApiFeedValidationErrorResponse {
}
