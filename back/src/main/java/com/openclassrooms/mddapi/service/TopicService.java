package com.openclassrooms.mddapi.service;

import java.util.List;

import com.openclassrooms.mddapi.dto.response.TopicReponse;

/**
 * Service de gestion des thèmes.
 */
public interface TopicService {

	/**
	 * Récupère la liste des thèmes en base de données.
	 * @param userId l'id de l'utilisateur connecté.
	 * @return la liste mappé pour envoyer au client.
	 */
	List<TopicReponse> getTopics(Long userId);

}
