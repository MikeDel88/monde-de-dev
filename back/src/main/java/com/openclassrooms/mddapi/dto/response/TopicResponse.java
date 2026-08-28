package com.openclassrooms.mddapi.dto.response;

/**
 * DTO utilisé pour renvoyé un thème.
 * @param id
 * @param title
 * @param description
 * @param subscribed si l'utilisateur est abonné ou non au thème.
 */
public record TopicResponse(
        Long id,
        String title,
        String description,
        Boolean subscribed
) {
}
