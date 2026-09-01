package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.response.CommentResponse;
import com.openclassrooms.mddapi.model.Comment;
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
}
