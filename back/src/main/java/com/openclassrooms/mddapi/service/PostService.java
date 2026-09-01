package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.PostRequest;
import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.dto.response.PostResponse;

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

    /**
     * Crée un post pour l'utilisateur donné sur le topic indiqué dans la requête.
     * @param postRequest les données du post à créer (topicId, title, content).
     * @param userId l'identifiant de l'utilisateur authentifié, auteur du post.
     * @throws com.openclassrooms.mddapi.exception.UserNotFoundException si l'utilisateur est introuvable.
     * @throws com.openclassrooms.mddapi.exception.TopicNotFoundException si le topic est introuvable ou non abonné par l'utilisateur.
     */
    void createPost(PostRequest postRequest, Long userId);

    /**
     * Récupère le détail d'un post avec ses commentaires, pour un utilisateur abonné au topic du post.
     * @param postId l'identifiant du post à récupérer.
     * @param userId l'identifiant de l'utilisateur authentifié.
     * @return le détail du post avec ses commentaires triés du plus récent au plus ancien.
     * @throws com.openclassrooms.mddapi.exception.UserNotFoundException si l'utilisateur est introuvable.
     * @throws com.openclassrooms.mddapi.exception.TopicNotFoundException si le post est introuvable ou si l'utilisateur n'est pas abonné à son topic.
     */
    PostResponse getPostById(Long postId, Long userId);
}
