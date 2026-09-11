package com.openclassrooms.mddapi.documentation.topic;

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
        responseCode = "403",
        description = "l'utilisateur n'est pas abonné à ce thème",
        content = @Content(schema = @Schema(implementation = ProblemDetail.class))
)
public @interface ApiTopicNotSubscribedResponse {
}
