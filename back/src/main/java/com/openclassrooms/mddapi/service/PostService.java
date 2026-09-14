package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.CommentRequest;
import com.openclassrooms.mddapi.dto.request.PostRequest;
import com.openclassrooms.mddapi.dto.response.CursorPageResponse;
import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.dto.response.PostResponse;
import com.openclassrooms.mddapi.exception.TopicNotSubscribedException;
import com.openclassrooms.mddapi.exception.UserNotFoundException;

/**
 * Service qui permet la gestion des posts.
 */
public interface PostService {
    /**
     * Permet de récupérer le fil d'actualité (posts des topics auxquels l'utilisateur
     * est abonné), trié par id et paginé par curseur.
     * @param cursor l'id du dernier post reçu par le client, {@code null} pour la première page.
     * @param direction le sens du tri, {@code asc} ou {@code desc} (défaut : {@code desc}).
     * @param userId l'identifiant de l'utilisateur authentifié.
     * @return la page de posts correspondante, adaptée pour un fil d'actualité.
     * @throws UserNotFoundException si l'utilisateur est introuvable.
     */
    CursorPageResponse<PostFeedResponse> getPosts(Long cursor, String direction, Long userId);

    /**
     * Crée un post pour l'utilisateur donné sur le topic indiqué dans la requête.
     * @param postRequest les données du post à créer (topicId, title, content).
     * @param userId l'identifiant de l'utilisateur authentifié, auteur du post.
     * @throws UserNotFoundException si l'utilisateur est introuvable.
     * @throws TopicNotSubscribedException si le topic n'est pas dans les abonnements de l'utilisateur.
     */
    void createPost(PostRequest postRequest, Long userId);

    /**
     * Récupère le détail d'un post avec ses commentaires, pour un utilisateur abonné au topic du post.
     * @param postId l'identifiant du post à récupérer.
     * @param userId l'identifiant de l'utilisateur authentifié.
     * @return le détail du post avec ses commentaires triés du plus récent au plus ancien.
     * @throws UserNotFoundException si l'utilisateur est introuvable.
     * @throws TopicNotSubscribedException si le post est introuvable ou si l'utilisateur n'est pas abonné à son topic.
     */
    PostResponse getPostById(Long postId, Long userId);

    /**
     * Ajoute un commentaire à un post, pour un utilisateur abonné au topic du post.
     * @param postId l'identifiant du post à commenter.
     * @param commentRequest les données du commentaire à créer (content).
     * @param userId l'identifiant de l'utilisateur authentifié, auteur du commentaire.
     * @throws UserNotFoundException si l'utilisateur est introuvable.
     * @throws TopicNotSubscribedException si le post est introuvable ou si l'utilisateur n'est pas abonné à son topic.
     */
    void createComment(Long postId, CommentRequest commentRequest, Long userId);
}
