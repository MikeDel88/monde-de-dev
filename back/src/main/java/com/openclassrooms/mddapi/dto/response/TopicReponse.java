package com.openclassrooms.mddapi.dto.response;

public record TopicReponse(
        Long id,
        String title,
        String description,
        Boolean subscribed
) {
}
