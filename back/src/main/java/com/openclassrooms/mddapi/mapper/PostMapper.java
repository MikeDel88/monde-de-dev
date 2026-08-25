package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.model.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PostMapper {

    @Mapping(target = "postDate", source = "date")
    @Mapping(target = "name", source = "user.name")
    PostFeedResponse toPostFeedResponse(Post post);

    List<PostFeedResponse> toPostFeedResponse(List<Post> posts);
}
