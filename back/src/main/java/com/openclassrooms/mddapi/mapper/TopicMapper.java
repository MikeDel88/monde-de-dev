package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.response.TopicReponse;
import com.openclassrooms.mddapi.model.BaseEntity;
import com.openclassrooms.mddapi.model.Topic;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TopicMapper {

    @Mapping(target = "subscribed", expression = "java(isSubscribed(topic, userId))")
    TopicReponse toTopicResponse(Topic topic, @Context Long userId);

    List<TopicReponse> toTopicResponse(List<Topic> topics, @Context Long userId);

    default boolean isSubscribed(Topic topic, Long userId) {
        return topic.getUsers().stream().map(BaseEntity::getId).anyMatch(userId::equals);
    }
}

