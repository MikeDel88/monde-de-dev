package com.openclassrooms.mddapi.exception;

/**
 * Source unique des codes d'erreur renvoyés par l'API (champ {@code detail}
 * d'un {@link org.springframework.http.ProblemDetail}, ou {@code code} d'un
 * {@link FieldError}). Évite la duplication de littéraux entre les
 * annotations Bean Validation et {@link GlobalExceptionHandler}.
 */
public final class ErrorCodes {

    private ErrorCodes() {
    }

    // Auth / register
    public static final String NAME_REQUIRED = "NAME_REQUIRED";
    public static final String NAME_TOO_LONG = "NAME_TOO_LONG";
    public static final String NAME_INVALID = "NAME_INVALID";
    public static final String EMAIL_REQUIRED = "EMAIL_REQUIRED";
    public static final String EMAIL_INVALID = "EMAIL_INVALID";
    public static final String EMAIL_TOO_LONG = "EMAIL_TOO_LONG";
    public static final String EMAIL_OR_NAME_REQUIRED = "EMAIL_OR_NAME_REQUIRED";
    public static final String PASSWORD_REQUIRED = "PASSWORD_REQUIRED";
    public static final String PASSWORD_TOO_SHORT = "PASSWORD_TOO_SHORT";
    public static final String PASSWORD_MISSING_UPPERCASE = "PASSWORD_MISSING_UPPERCASE";
    public static final String PASSWORD_MISSING_LOWERCASE = "PASSWORD_MISSING_LOWERCASE";
    public static final String PASSWORD_MISSING_DIGIT = "PASSWORD_MISSING_DIGIT";
    public static final String PASSWORD_MISSING_SPECIAL_CHAR = "PASSWORD_MISSING_SPECIAL_CHAR";
    public static final String PASSWORD_INVALID = "PASSWORD_INVALID";
    public static final String CURRENT_PASSWORD_REQUIRED = "CURRENT_PASSWORD_REQUIRED";
    public static final String CURRENT_PASSWORD_INVALID = "CURRENT_PASSWORD_INVALID";
    public static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";

    // Topic / subscription
    public static final String TOPIC_REQUIRED = "TOPIC_REQUIRED";
    public static final String TOPIC_POSITIVE = "TOPIC_POSITIVE";
    public static final String TOPIC_NOT_FOUND = "TOPIC_NOT_FOUND";
    public static final String TOPIC_NOT_SUBSCRIBED = "TOPIC_NOT_SUBSCRIBED";

    // Post / comment
    public static final String TITLE_REQUIRED = "TITLE_REQUIRED";
    public static final String TITLE_TOO_LONG = "TITLE_TOO_LONG";
    public static final String CONTENT_REQUIRED = "CONTENT_REQUIRED";
    public static final String CONTENT_TOO_LONG = "CONTENT_TOO_LONG";
    public static final String DIRECTION_INVALID = "DIRECTION_INVALID";
    public static final String CURSOR_POSITIVE = "CURSOR_POSITIVE";
    public static final String POST_ID_POSITIVE = "POST_ID_POSITIVE";

    // User
    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";

    // Génériques / transverses
    public static final String ACCESS_DENIED = "ACCESS_DENIED";
    public static final String RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
    public static final String DATA_CONFLICT = "DATA_CONFLICT";
    public static final String PARAMETER_INVALID = "PARAMETER_INVALID";
    public static final String MALFORMED_JSON = "MALFORMED_JSON";
    public static final String INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
}
