package com.openclassrooms.mddapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsque le mot de passe actuel fourni lors d'un changement de
 * mot de passe ne correspond pas à celui enregistré pour l'utilisateur,
 * traduite en réponse HTTP 400 via {@link ResponseStatus}.
 */
@ResponseStatus(value = HttpStatus.BAD_REQUEST)
public class InvalidCurrentPasswordException extends RuntimeException {}
