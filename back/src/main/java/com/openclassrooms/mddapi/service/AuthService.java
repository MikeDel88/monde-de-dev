package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.RegisterRequest;

/**
 * Service qui permet la gestion de l'authentification de l'utilisateur.
 */
public interface AuthService {
    /**
     * Enregistrement d'un utilisateur en base de données
     * @param request Dto qui permet l'enregistrement
     */
    void register(RegisterRequest request);
}
