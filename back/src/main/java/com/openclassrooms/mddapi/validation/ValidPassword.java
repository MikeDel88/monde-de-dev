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

/**
 * Contrainte Bean Validation composée pour les mots de passe : valide qu'un
 * mot de passe fait entre 8 et 255 caractères et contient au moins une
 * majuscule, une minuscule, un chiffre et un caractère spécial
 * ({@code #?!@$%^&*-}). Chaque règle violée produit son propre message
 * (PASSWORD_TOO_SHORT, PASSWORD_MISSING_UPPERCASE, PASSWORD_MISSING_LOWERCASE,
 * PASSWORD_MISSING_DIGIT, PASSWORD_MISSING_SPECIAL_CHAR). Contrainte composée
 * sans ConstraintValidator dédié ({@code validatedBy = {}}) : la validation
 * repose entièrement sur les annotations @Size/@Pattern empilées.
 */
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
    /** Message par défaut, retourné si aucune des règles composées n'est déclenchée individuellement. */
    String message() default "PASSWORD_INVALID";

    /** Groupes de validation Bean Validation (standard, non utilisé actuellement). */
    Class<?>[] groups() default {};

    /** Payload Bean Validation (standard, non utilisé actuellement). */
    Class<? extends Payload>[] payload() default {};
}
