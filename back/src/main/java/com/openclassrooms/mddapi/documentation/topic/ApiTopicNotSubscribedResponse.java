package com.openclassrooms.mddapi.documentation.topic;

import com.openclassrooms.mddapi.exception.ErrorCodes;
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
        description = "L'utilisateur n'est pas abonné à ce thème. Code : " + ErrorCodes.TOPIC_NOT_SUBSCRIBED,
        content = @Content(schema = @Schema(implementation = ProblemDetail.class))
)
public @interface ApiTopicNotSubscribedResponse {
}
