package com.openclassrooms.mddapi.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record PostFeedResponse(
        Long id,
        String title,
        @JsonProperty("date")
        LocalDateTime postDate,
        @JsonProperty("author")
        String name,
        @JsonProperty("preview")
        String content
) {
}
