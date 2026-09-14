package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.request.PostRequest;
import com.openclassrooms.mddapi.dto.response.CommentResponse;
import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.dto.response.PostResponse;
import com.openclassrooms.mddapi.model.Post;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Mapper MapStruct entre l'entité {@link Post} et le DTO {@link PostFeedResponse}
 * exposé par le fil d'actualité.
 */
@Mapper(componentModel = "spring")
public interface PostMapper {

    /**
     * Convertit un post en réponse pour le fil d'actualité.
     * @param post l'entité post source.
     * @return PostFeedResponse la réponse mappée (date → postDate, user.name → name).
     */
    @Mapping(target = "postDate", source = "date")
    @Mapping(target = "name", source = "user.name")
    PostFeedResponse toPostFeedResponse(Post post);

    /**
     * Convertit une requête de création de post en entité {@link Post}, avec la date de publication fixée au moment de l'appel.
     * Implémentation manuelle (pas de génération MapStruct) : {@link Post}
     * n'expose pas de setters, la construction passe donc par son
     * constructeur dédié.
     * @param postRequest les données du post à créer.
     * @param user l'auteur du post.
     * @param topic le topic auquel le post est rattaché.
     * @return Post l'entité prête à être persistée.
     */
    default Post toPost(PostRequest postRequest, User user, Topic topic) {
        return new Post(postRequest.title(), postRequest.content(), LocalDateTime.now(), topic, user);
    }

    /**
     * Convertit un post en réponse détaillée pour l'affichage d'un post unique.
     * @param post l'entité post source.
     * @return PostResponse la réponse mappée (date → postDate, user.name → name).
     */
    @Mapping(target = "postDate", source = "post.date")
    @Mapping(target = "name", source = "post.user.name")
    @Mapping(target = "topicName", source = "post.topic.title")
    @Mapping(target = "comments", source = "commentResponses")
    PostResponse toPostResponse(Post post, List<CommentResponse> commentResponses);
}
