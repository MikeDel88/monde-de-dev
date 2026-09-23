package com.openclassrooms.mddapi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception levée lorsque le nombre de tentatives de connexion ou d'inscription
 * dépasse la limite autorisée (par IP ou par compte visé), traduite en réponse
 * HTTP 429 via {@link ResponseStatus}. Volontairement générique pour ne pas
 * révéler si c'est la limite IP ou la limite compte qui a été atteinte.
 */
@ResponseStatus(value = HttpStatus.TOO_MANY_REQUESTS)
public class RateLimitExceededException extends RuntimeException {}
