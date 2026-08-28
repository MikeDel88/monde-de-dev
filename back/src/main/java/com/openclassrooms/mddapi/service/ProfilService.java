package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.UpdateProfilPasswordRequest;
import com.openclassrooms.mddapi.dto.request.UpdateProfilRequest;
import com.openclassrooms.mddapi.dto.response.ProfileResponse;

/**
 * Service de gestion du profil utilisateur.
 */
public interface ProfilService {

    /**
     * Récupère le profil de l'utilisateur connecté avec la liste des thèmes auxquels il est abonné.
     * @param userId l'id de l'utilisateur connecté.
     * @return le profil mappé pour envoyer au client.
     */
    ProfileResponse getProfil(Long userId);

    /**
     * Met à jour partiellement le nom et/ou l'email de l'utilisateur connecté.
     * @param userId l'id de l'utilisateur connecté.
     * @param request les champs à mettre à jour (les champs null ne sont pas modifiés).
     * @return ProfileResponse le profil mis à jour.
     */
    ProfileResponse updateProfil(Long userId, UpdateProfilRequest request);

    /**
     * Met à jour le mot de passe de l'utilisateur connecté, après vérification du mot de passe actuel.
     * @param userId l'id de l'utilisateur connecté.
     * @param request le mot de passe actuel (vérifié avant application) et le nouveau mot de passe.
     * @throws com.openclassrooms.mddapi.exception.UserNotFoundException si l'utilisateur n'existe pas.
     * @throws com.openclassrooms.mddapi.exception.InvalidCurrentPasswordException si le mot de passe
     *         actuel fourni ne correspond pas à celui enregistré.
     */
    void updatePassword(Long userId, UpdateProfilPasswordRequest request);
}
