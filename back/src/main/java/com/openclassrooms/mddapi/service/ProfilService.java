package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.response.ProfilResponse;

/**
 * Service de gestion du profil utilisateur.
 */
public interface ProfilService {

    /**
     * Récupère le profil de l'utilisateur connecté avec la liste des thèmes auxquels il est abonné.
     * @param userId l'id de l'utilisateur connecté.
     * @return le profil mappé pour envoyer au client.
     */
    ProfilResponse getProfil(Long userId);
}
