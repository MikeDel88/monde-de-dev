package com.openclassrooms.mddapi.exception;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

/**
 * Gestionnaire global d'exceptions de l'API. Traduit les exceptions levées par
 * les contrôleurs en réponses HTTP standardisées au format ProblemDetail
 * (RFC 7807).
 */
@Log4j2
@Order()
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Gère les échecs de validation des DTO annotés @Valid dans le corps de la
     * requête (@RequestBody).
     * @param ex l'exception de validation levée par Spring.
     * @return BodyProblemDetail 400 avec la liste des erreurs par champ.
     */
    @ExceptionHandler(exception = MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BodyProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        log.error("handleValidation : {}", ex.getMessage());
        List<FieldError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> new FieldError(fieldError.getField(), fieldError.getDefaultMessage()))
                .toList();
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        BodyProblemDetail bpd = BodyProblemDetail.from(pd);
        bpd.setErrors(errors);

        return bpd;
    }

    /**
     * Gère les violations de contraintes Bean Validation sur les paramètres
     * (@RequestParam / @PathVariable).
     * @param ex l'exception de violation de contrainte levée par Bean Validation.
     * @return BodyProblemDetail 400 avec la liste des erreurs par propriété.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BodyProblemDetail handleConstraintViolation(ConstraintViolationException ex) {
        log.error("handleConstraintViolation : {}", ex.getMessage());
        List<FieldError> errors = ex.getConstraintViolations().stream()
                .map(violation -> new FieldError(violation.getPropertyPath().toString(), violation.getMessage()))
                .toList();
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        BodyProblemDetail bpd = BodyProblemDetail.from(pd);
        bpd.setErrors(errors);

        return bpd;
    }

    /**
     * Gère le cas où l'utilisateur demandé n'existe pas.
     * @param ex l'exception levée lorsque l'utilisateur est introuvable.
     * @return ProblemDetail 404.
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail handleUserNotFound(UserNotFoundException ex) {
        log.error("handleUserNotFound : {}", ex.getMessage());
        return ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
    }

    /**
     * Gère le cas où le topic demandé n'existe pas.
     * @param ex l'exception levée lorsque le topic est introuvable.
     * @return ProblemDetail 404.
     */
    @ExceptionHandler(TopicNotFoundException.class)
    public ProblemDetail handleTopicNotFound(TopicNotFoundException ex) {
        log.error("handleTopicNotFound : {}", ex.getMessage());
        return ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
    }

    /**
     * Gère les échecs de validation sur les paramètres de méthode de contrôleur
     * (@RequestParam / @PathVariable annotés directement, hors @RequestBody).
     * @param ex l'exception de validation levée par Spring au niveau du handler.
     * @return BodyProblemDetail 400 avec la liste des erreurs par paramètre.
     */
    @ExceptionHandler(HandlerMethodValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public BodyProblemDetail handleHandlerMethodValidation(HandlerMethodValidationException ex) {
        log.error("handleHandlerMethodValidation : {}", ex.getMessage());
        List<FieldError> errors = ex.getParameterValidationResults().stream()
                .flatMap(result -> result.getResolvableErrors().stream()
                        .map(error -> new FieldError(result.getMethodParameter().getParameterName(), error.getDefaultMessage())))
                .toList();
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        BodyProblemDetail bpd = BodyProblemDetail.from(pd);
        bpd.setErrors(errors);

        return bpd;
    }

    /**
     * Gère le cas où un paramètre de méthode de contrôleur (@PathVariable /
     * @RequestParam) ne peut pas être converti vers le type attendu (ex. un
     * id non numérique dans l'URL).
     * @param ex l'exception levée par Spring lors de la conversion du paramètre.
     * @return ProblemDetail 400 avec le nom du paramètre invalide.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ProblemDetail handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        log.error("handleMethodArgumentTypeMismatch : {}", ex.getMessage());
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                "Le paramètre '" + ex.getName() + "' est invalide.");
    }

    /**
     * Gère un corps de requête JSON malformé ou illisible.
     * @param ex l'exception levée lors de la désérialisation du corps de la requête.
     * @return ProblemDetail 400 avec le message "Malformed JSON request".
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ProblemDetail handleMessageNotReadable(HttpMessageNotReadableException ex) {
        log.error("handleMessageNotReadable : {}", ex.getMessage());
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Malformed JSON request");
    }

    /**
     * Gère les violations de contraintes d'intégrité en base de données
     * (ex. contrainte d'unicité sur l'email, le nom d'utilisateur ou le titre
     * d'un topic).
     * @param ex l'exception levée par la couche de persistance.
     * @return ProblemDetail 409 (conflit).
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("handleDataIntegrityViolation : {}", ex.getMessage());
        return ProblemDetail.forStatus(HttpStatus.CONFLICT);
    }

    /**
     * Filet de sécurité pour toute exception non gérée explicitement par les
     * autres handlers. Ne remonte pas les détails internes au client.
     * @param ex l'exception non gérée.
     * @return ProblemDetail 500 avec un message générique.
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        log.error("handleGenericException : {}", ex.getMessage());
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,  "Internal server error");
    }
}
