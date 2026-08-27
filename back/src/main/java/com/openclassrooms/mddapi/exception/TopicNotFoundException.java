package com.openclassrooms.mddapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsque le topic demandé est introuvable, traduite en
 * réponse HTTP 404 via {@link ResponseStatus}.
 */
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class TopicNotFoundException extends RuntimeException {}
