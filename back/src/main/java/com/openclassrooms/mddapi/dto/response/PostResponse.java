package com.openclassrooms.mddapi.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO utilisé pour renvoyer le détail d'un post avec ses commentaires.
 * @param id
 * @param title
 * @param postDate
 * @param name
 * @param topicName
 * @param content
 * @param comments
 */
public record PostResponse(
        Long id,
        String title,
        @JsonProperty("date")
        LocalDateTime postDate,
        @JsonProperty("author")
        String name,
        String topicName,
        String content,
        List<CommentResponse> comments
) {
}
