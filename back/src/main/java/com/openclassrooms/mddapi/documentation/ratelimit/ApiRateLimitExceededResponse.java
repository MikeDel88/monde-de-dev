package com.openclassrooms.mddapi.documentation.ratelimit;

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
        responseCode = "429",
        description = "Trop de tentatives depuis cette IP ou pour ce compte, réessayer plus tard. Code : "
                + ErrorCodes.RATE_LIMIT_EXCEEDED,
        content = @Content(schema = @Schema(implementation = ProblemDetail.class))
)
public @interface ApiRateLimitExceededResponse {
}
