package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.request.CommentRequest;
import com.openclassrooms.mddapi.dto.response.CommentResponse;
import com.openclassrooms.mddapi.model.Comment;
import com.openclassrooms.mddapi.model.Post;
import com.openclassrooms.mddapi.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper MapStruct entre l'entité {@link Comment} et le DTO {@link CommentResponse}
 * exposé dans le détail d'un post.
 */
@Mapper(componentModel = "spring")
public interface CommentMapper {

    /**
     * Convertit un commentaire en réponse.
     * @param comment l'entité commentaire source.
     * @return CommentResponse la réponse mappée (user.name → author).
     */
    @Mapping(target = "author", source = "user.name")
    CommentResponse toCommentResponse(Comment comment);

    /**
     * Convertit une liste de commentaires en liste de réponses.
     * @param comments la liste des commentaires source.
     * @return List<CommentResponse> la liste des réponses mappées.
     */
    List<CommentResponse> toCommentResponseList(List<Comment> comments);

    /**
     * Convertit une requête de création de commentaire en entité commentaire.
     * @param commentRequest les données du commentaire à créer.
     * @param user l'auteur du commentaire.
     * @param post le post commenté.
     * @return Comment l'entité commentaire mappée, datée du moment de l'appel.
     */
    @Mapping(target = "user", source = "user")
    @Mapping(target = "post", source = "post")
    @Mapping(target = "date", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "content", source = "commentRequest.content")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Comment toComment(CommentRequest commentRequest, User user, Post post);
}
