package com.openclassrooms.mddapi.dto.response;

public record TopicReponse(
        String title,
        String description,
        Boolean subscribed
) {
}
