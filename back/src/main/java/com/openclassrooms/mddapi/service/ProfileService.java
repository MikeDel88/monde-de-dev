package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.UpdateProfileRequest;
import com.openclassrooms.mddapi.dto.response.ProfileResponse;

/**
 * Service de gestion du profil utilisateur.
 */
public interface ProfileService {

    /**
     * Récupère le profil de l'utilisateur connecté avec la liste des thèmes auxquels il est abonné.
     * @param userId l'id de l'utilisateur connecté.
     * @return le profil mappé pour envoyer au client.
     */
    ProfileResponse getProfile(Long userId);

    /**
     * Met à jour partiellement le nom et/ou l'email et/ou password de l'utilisateur connecté, après vérification du mot de passe actuel.
     * @param userId l'id de l'utilisateur connecté.
     * @param request les champs à mettre à jour (les champs null ne sont pas modifiés).
     * @throws com.openclassrooms.mddapi.exception.UserNotFoundException si l'utilisateur n'existe pas.
     * @throws com.openclassrooms.mddapi.exception.InvalidCurrentPasswordException si le mot de passe
     * actuel fourni ne correspond pas à celui enregistré.
     * @return ProfileResponse le profil mis à jour.
     */
    ProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
}
