package com.openclassrooms.mddapi.dto.response;

import java.util.List;

public record ProfilResponse(
        String name,
        String email,
        List<TopicResponse> topics
) {
}
