package com.openclassrooms.mddapi.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.method.MethodValidationResult;
import org.springframework.validation.method.ParameterValidationResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleValidation_returnsFieldErrors() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "target");
        bindingResult.addError(new org.springframework.validation.FieldError("target", "name", "NAME_REQUIRED"));
        MethodParameter methodParameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("dummy"), -1);
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

        BodyProblemDetail result = handler.handleValidation(ex);

        assertThat(result.getStatus()).isEqualTo(400);
        assertThat(result.getErrors()).hasSize(1);
        assertThat(result.getErrors().get(0).field()).isEqualTo("name");
        assertThat(result.getErrors().get(0).code()).isEqualTo("NAME_REQUIRED");
    }

    @SuppressWarnings("unused")
    private void dummy() {
    }

    @Test
    void handleConstraintViolation_returnsFieldErrors() {
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        Path path = mock(Path.class);
        when(path.toString()).thenReturn("cursor");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn(ErrorCodes.CURSOR_POSITIVE);
        ConstraintViolationException ex = new ConstraintViolationException(Set.of(violation));

        BodyProblemDetail result = handler.handleConstraintViolation(ex);

        assertThat(result.getStatus()).isEqualTo(400);
        assertThat(result.getErrors()).hasSize(1);
        assertThat(result.getErrors().get(0).field()).isEqualTo("cursor");
        assertThat(result.getErrors().get(0).code()).isEqualTo(ErrorCodes.CURSOR_POSITIVE);
    }

    @Test
    void handleUserNotFound_returns404() {
        ProblemDetail result = handler.handleUserNotFound(new UserNotFoundException());

        assertThat(result.getStatus()).isEqualTo(404);
        assertThat(result.getDetail()).isEqualTo(ErrorCodes.USER_NOT_FOUND);
    }

    @Test
    void handleTopicNotFound_returns404() {
        ProblemDetail result = handler.handleTopicNotFound(new TopicNotFoundException());

        assertThat(result.getStatus()).isEqualTo(404);
        assertThat(result.getDetail()).isEqualTo(ErrorCodes.TOPIC_NOT_FOUND);
    }

    @Test
    void handleInvalidCredentials_returns401() {
        ProblemDetail result = handler.handleInvalidCredentials(new InvalidCredentialsException());

        assertThat(result.getStatus()).isEqualTo(401);
        assertThat(result.getDetail()).isEqualTo(ErrorCodes.INVALID_CREDENTIALS);
    }

    @Test
    void handleAuthenticationException_returns401() {
        ProblemDetail result = handler.handleAuthenticationException(new BadCredentialsException("bad"));

        assertThat(result.getStatus()).isEqualTo(401);
        assertThat(result.getDetail()).isEqualTo(ErrorCodes.INVALID_CREDENTIALS);
    }

    @Test
    void handleTopicNotSubscribed_returns403() {
        ProblemDetail result = handler.handleTopicNotSubscribed(new TopicNotSubscribedException());

        assertThat(result.getStatus()).isEqualTo(403);
        assertThat(result.getDetail()).isEqualTo(ErrorCodes.TOPIC_NOT_SUBSCRIBED);
    }

    @Test
    void handleInvalidCurrentPassword_returns400WithFieldError() {
        BodyProblemDetail result = handler.handleInvalidCurrentPassword(new InvalidCurrentPasswordException());

        assertThat(result.getStatus()).isEqualTo(400);
        assertThat(result.getErrors()).hasSize(1);
        assertThat(result.getErrors().get(0).field()).isEqualTo("currentPassword");
        assertThat(result.getErrors().get(0).code()).isEqualTo(ErrorCodes.CURRENT_PASSWORD_INVALID);
    }

    @Test
    void handleRateLimitExceeded_returns429() {
        ProblemDetail result = handler.handleRateLimitExceeded(new RateLimitExceededException());

        assertThat(result.getStatus()).isEqualTo(429);
        assertThat(result.getDetail()).isEqualTo(ErrorCodes.RATE_LIMIT_EXCEEDED);
    }

    @Test
    void handleHandlerMethodValidation_returnsFieldErrors() throws NoSuchMethodException {
        MethodValidationResult validationResult = mock(MethodValidationResult.class);
        ParameterValidationResult parameterResult = mock(ParameterValidationResult.class);
        MethodParameter methodParameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("dummy"), -1);
        org.springframework.context.MessageSourceResolvable resolvable =
                mock(org.springframework.context.MessageSourceResolvable.class);
        when(resolvable.getDefaultMessage()).thenReturn(ErrorCodes.CURSOR_POSITIVE);
        when(parameterResult.getResolvableErrors()).thenReturn(List.of(resolvable));
        when(parameterResult.getMethodParameter()).thenReturn(methodParameter);
        when(validationResult.getParameterValidationResults()).thenReturn(List.of(parameterResult));
        HandlerMethodValidationException ex = new HandlerMethodValidationException(validationResult);

        BodyProblemDetail result = handler.handleHandlerMethodValidation(ex);

        assertThat(result.getStatus()).isEqualTo(400);
        assertThat(result.getErrors()).hasSize(1);
        assertThat(result.getErrors().get(0).code()).isEqualTo(ErrorCodes.CURSOR_POSITIVE);
    }

    @Test
    void handleMethodArgumentTypeMismatch_returns400() throws NoSuchMethodException {
        MethodParameter methodParameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("dummy"), -1);
        MethodArgumentTypeMismatchException ex =
                new MethodArgumentTypeMismatchException("abc", Long.class, "postId", methodParameter, new NumberFormatException());

        ProblemDetail result = handler.handleMethodArgumentTypeMismatch(ex);

        assertThat(result.getStatus()).isEqualTo(400);
        assertThat(result.getDetail()).isEqualTo(ErrorCodes.PARAMETER_INVALID);
    }

    @Test
    void handleMessageNotReadable_returns400() {
        HttpMessageNotReadableException ex = mock(HttpMessageNotReadableException.class);

        ProblemDetail result = handler.handleMessageNotReadable(ex);

        assertThat(result.getStatus()).isEqualTo(400);
        assertThat(result.getDetail()).isEqualTo(ErrorCodes.MALFORMED_JSON);
    }

    @Test
    void handleDataIntegrityViolation_returns409() {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("duplicate");

        ProblemDetail result = handler.handleDataIntegrityViolation(ex);

        assertThat(result.getStatus()).isEqualTo(409);
        assertThat(result.getDetail()).isEqualTo(ErrorCodes.DATA_CONFLICT);
    }

    @Test
    void handleGenericException_returns500() {
        ProblemDetail result = handler.handleGenericException(new RuntimeException("boom"));

        assertThat(result.getStatus()).isEqualTo(500);
        assertThat(result.getDetail()).isEqualTo(ErrorCodes.INTERNAL_SERVER_ERROR);
    }
}
