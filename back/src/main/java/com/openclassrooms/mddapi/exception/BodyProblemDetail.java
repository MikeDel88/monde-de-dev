package com.openclassrooms.mddapi.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.ProblemDetail;

import java.util.List;

/**
 * Classe qui permet de renvoyer une liste d'erreur
 * utile lors de validation d'un body.
 */
@Getter
@Setter
public class BodyProblemDetail extends ProblemDetail {

    private List<FieldError> errors;

    protected BodyProblemDetail(ProblemDetail problemDetail) {
        super(problemDetail);
    }

    public static BodyProblemDetail from(ProblemDetail problemDetail) {
        return new BodyProblemDetail(problemDetail);
    }
}
