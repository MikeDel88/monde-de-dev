package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.LoginRequest;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.dto.response.AuthResponse;

/**
 * Service qui permet la gestion de l'authentification de l'utilisateur.
 */
public interface AuthService {
    /**
     * Enregistrement d'un utilisateur en base de données
     * @param request Dto RegisterRequest qui permet l'enregistrement
     */
    void register(RegisterRequest request);

    /**
     * Authentification de l'utilisateur
     * @param request Dto LoginRequest qui contient emailOrUsername et le password.
     */
    AuthResponse login(LoginRequest request);
}
