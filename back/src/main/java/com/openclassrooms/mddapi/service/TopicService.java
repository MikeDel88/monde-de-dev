package com.openclassrooms.mddapi.service;

import java.util.List;

import com.openclassrooms.mddapi.dto.response.TopicResponse;

/**
 * Service de gestion des thèmes.
 */
public interface TopicService {

	/**
	 * Récupère la liste des thèmes en base de données.
	 * @param userId l'id de l'utilisateur connecté.
	 * @return la liste mappé pour envoyer au client.
	 */
	List<TopicResponse> getTopics(Long userId);

	/**
	 * Abonne l'utilisateur au thème donné.
	 * @param topicId l'id du thème.
	 * @param userId l'id de l'utilisateur connecté.
	 */
	void subscribe(Long topicId, Long userId);
}
