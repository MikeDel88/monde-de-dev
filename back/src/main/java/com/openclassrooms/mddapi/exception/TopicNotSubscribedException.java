package com.openclassrooms.mddapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsque l'utlisateur n'est pas abonné au topic
 * réponse HTTP 403 via {@link ResponseStatus}.
 */
@ResponseStatus(value = HttpStatus.FORBIDDEN)
public class TopicNotSubscribedException extends RuntimeException {}
