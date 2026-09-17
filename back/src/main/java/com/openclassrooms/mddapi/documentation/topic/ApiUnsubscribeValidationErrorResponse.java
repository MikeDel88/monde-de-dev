package com.openclassrooms.mddapi.documentation.topic;

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
        description = "Le paramètre topicId est invalide. Code : "
                + ErrorCodes.TOPIC_POSITIVE + " (doit être un nombre positif)",
        content = @Content(schema = @Schema(implementation = BodyProblemDetail.class))
)
public @interface ApiUnsubscribeValidationErrorResponse {
}
