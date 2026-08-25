package com.openclassrooms.mddapi.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Constraint(validatedBy = {})
@Size(min = 8, max = 255, message = "PASSWORD_TOO_SHORT")
@Pattern(regexp = "^(?=.*?[A-Z]).+$", message = "PASSWORD_MISSING_UPPERCASE")
@Pattern(regexp = "^(?=.*?[a-z]).+$", message = "PASSWORD_MISSING_LOWERCASE")
@Pattern(regexp = "^(?=.*?[0-9]).+$", message = "PASSWORD_MISSING_DIGIT")
@Pattern(regexp = "^(?=.*?[#?!@$%^&*-]).+$", message = "PASSWORD_MISSING_SPECIAL_CHAR")
public @interface ValidPassword {
    String message() default "PASSWORD_INVALID";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
