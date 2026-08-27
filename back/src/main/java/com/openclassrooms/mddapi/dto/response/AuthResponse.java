package com.openclassrooms.mddapi.dto.response;

/**
 * DTO utilisé lors de la réponse à la connexion.
 * @param token
 */
public record AuthResponse(
        String token
) {
}
