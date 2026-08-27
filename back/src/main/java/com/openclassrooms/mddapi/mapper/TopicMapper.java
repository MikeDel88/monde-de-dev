package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.response.TopicReponse;
import com.openclassrooms.mddapi.model.BaseEntity;
import com.openclassrooms.mddapi.model.Topic;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper MapStruct entre l'entité {@link Topic} et le DTO {@link TopicReponse},
 * avec calcul de l'état d'abonnement de l'utilisateur courant.
 */
@Mapper(componentModel = "spring")
public interface TopicMapper {

    /**
     * Convertit un topic en réponse, en calculant l'état d'abonnement de
     * l'utilisateur via {@link #isSubscribed(Topic, Long)}.
     * @param topic le topic source.
     * @param userId l'identifiant de l'utilisateur courant.
     * @return TopicReponse la réponse mappée, avec le champ subscribed renseigné.
     */
    @Mapping(target = "subscribed", expression = "java(isSubscribed(topic, userId))")
    TopicReponse toTopicResponse(Topic topic, @Context Long userId);

    /**
     * Convertit une liste de topics en liste de réponses pour l'utilisateur donné.
     * @param topics la liste des topics source.
     * @param userId l'identifiant de l'utilisateur courant.
     * @return List TopicReponse; la liste des réponses mappées.
     */
    List<TopicReponse> toTopicResponse(List<Topic> topics, @Context Long userId);

    /**
     * Indique si l'utilisateur donné est abonné au topic.
     * @param topic le topic à vérifier.
     * @param userId l'identifiant de l'utilisateur courant.
     * @return boolean true si l'utilisateur figure parmi les abonnés du topic.
     */
    default boolean isSubscribed(Topic topic, Long userId) {
        return topic.getUsers().stream().map(BaseEntity::getId).anyMatch(userId::equals);
    }
}

