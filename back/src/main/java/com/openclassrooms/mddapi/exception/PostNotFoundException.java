package com.openclassrooms.mddapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsque le post demandé est introuvable, ou lorsque
 * l'utilisateur n'est pas abonné au topic auquel il appartient, traduite en
 * réponse HTTP 404 via {@link ResponseStatus}.
 */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class PostNotFoundException extends RuntimeException {}
