package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.model.Topic;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Set;

/**
 * Mapper MapStruct entre l'entité {@link Topic} et le DTO {@link TopicResponse},
 * avec calcul de l'état d'abonnement de l'utilisateur courant.
 */
@Mapper(componentModel = "spring")
public interface TopicMapper {

    /**
     * Convertit un topic en réponse, en calculant l'état d'abonnement via
     * {@link #isSubscribed(Topic, Set)}.
     * @param topic le topic source.
     * @param subscribedTopicIds les ids des topics auxquels l'utilisateur courant est abonné.
     * @return TopicResponse la réponse mappée, avec le champ subscribed renseigné.
     */
    @Mapping(target = "subscribed", expression = "java(isSubscribed(topic, subscribedTopicIds))")
    TopicResponse toTopicResponse(Topic topic, @Context Set<Long> subscribedTopicIds);

    /**
     * Convertit une liste de topics en liste de réponses pour l'utilisateur donné.
     * @param topics la liste des topics source.
     * @param subscribedTopicIds les ids des topics auxquels l'utilisateur courant est abonné.
     * @return {@code List<TopicResponse>} la liste des réponses mappées.
     */
    List<TopicResponse> toTopicResponse(List<Topic> topics, @Context Set<Long> subscribedTopicIds);

    /**
     * Indique si le topic figure parmi les ids fournis. Comparé à un parcours
     * de {@code topic.getUsers()}, évite de déclencher une requête SQL par
     * topic (chaque {@code Set<User>} étant chargé en lazy) lors du mapping
     * d'une liste de topics.
     * @param topic le topic à vérifier.
     * @param subscribedTopicIds les ids des topics auxquels l'utilisateur courant est abonné.
     * @return boolean true si l'id du topic figure parmi les ids fournis.
     */
    default boolean isSubscribed(Topic topic, Set<Long> subscribedTopicIds) {
        return subscribedTopicIds.contains(topic.getId());
    }
}
