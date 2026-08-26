package com.openclassrooms.mddapi.exception;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.ProblemDetail;

import java.util.List;

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
