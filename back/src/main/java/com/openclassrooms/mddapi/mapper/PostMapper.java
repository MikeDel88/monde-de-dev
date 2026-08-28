package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.model.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

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
     * Convertit une liste de posts en liste de réponses pour le fil d'actualité.
     * @param posts la liste des posts source.
     * @return List&lt;PostFeedResponse&gt; la liste des réponses mappées.
     */
    List<PostFeedResponse> toPostFeedResponse(List<Post> posts);
}
