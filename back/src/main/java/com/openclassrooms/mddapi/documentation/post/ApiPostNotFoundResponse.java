package com.openclassrooms.mddapi.documentation.post;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.ProblemDetail;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@ApiResponse(
        responseCode = "404",
        description = "le post est introuvable, ou l'utilisateur n'est pas abonné à son topic",
        content = @Content(schema = @Schema(implementation = ProblemDetail.class))
)
public @interface ApiPostNotFoundResponse {
}
