package com.openclassrooms.mddapi.dto.response;

import java.util.List;

/**
 * DTO utilisé pour renvoyer le profil de l'utilisateur connecté.
 * @param name le nom de l'utilisateur.
 * @param email l'email de l'utilisateur.
 * @param topics la liste des thèmes auxquels l'utilisateur est abonné.
 */
public record ProfilResponse(
        String name,
        String email,
        List<TopicResponse> topics
) {
}
