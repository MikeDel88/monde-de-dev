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
        description = "Un ou plusieurs champs sont invalides. Codes possibles :\n"
                + "- " + ErrorCodes.TOPIC_REQUIRED + " : le topicId est requis\n"
                + "- " + ErrorCodes.TOPIC_POSITIVE + " : le topicId doit être un nombre positif\n"
                + "- " + ErrorCodes.TITLE_REQUIRED + " : le titre est requis\n"
                + "- " + ErrorCodes.TITLE_TOO_LONG + " : le titre dépasse 255 caractères\n"
                + "- " + ErrorCodes.CONTENT_REQUIRED + " : le contenu est requis\n"
                + "- " + ErrorCodes.CONTENT_TOO_LONG + " : le contenu dépasse 65535 caractères",
        content = @Content(schema = @Schema(implementation = BodyProblemDetail.class))
)
public @interface ApiPostCreateValidationErrorResponse {
}
