package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.model.User;

/**
 * JwtService permet la génération du token d'accès de l'utilisateur.
 */
public interface JwtService {
    /**
     * On génère un token avec une expirationTime.
     * @param user utilisé dans les claims.
     * @return String le token généré.
     */
    String generateAccessToken(User user);
}
