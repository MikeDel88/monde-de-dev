package com.openclassrooms.mddapi.dto.response;

/**
 * DTO utilisé pour renvoyer un commentaire dans le détail d'un post.
 * @param author
 * @param content
 */
public record CommentResponse(
    String author,
    String content
) {
}
