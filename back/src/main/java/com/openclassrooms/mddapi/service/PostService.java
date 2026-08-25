package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.response.PostFeedResponse;

import java.util.List;

/**
 * Service qui permet la gestion des posts.
 */
public interface PostService {
    /**
     * Permet de récupérer une liste tri par ordre
     * @param sort "asc" ou "desc"
     * @return liste des Posts spécialement adaptée pour un fil d'actualité.
     */
    List<PostFeedResponse> getPosts(String sort, Long userId);
}
