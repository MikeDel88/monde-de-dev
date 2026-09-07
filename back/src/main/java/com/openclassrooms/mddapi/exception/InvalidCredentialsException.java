package com.openclassrooms.mddapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsque les identifiants de connexion (email/nom d'utilisateur
 * ou mot de passe) sont invalides, traduite en réponse HTTP 401 via
 * {@link ResponseStatus}. Volontairement générique pour ne pas révéler si
 * c'est le compte ou le mot de passe qui est en cause.
 */
@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
public class InvalidCredentialsException extends RuntimeException {}
