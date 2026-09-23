package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.request.PostRequest;
import com.openclassrooms.mddapi.dto.response.CommentResponse;
import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.dto.response.PostResponse;
import com.openclassrooms.mddapi.model.Post;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PostMapperTest {

    private final PostMapper postMapper = new PostMapperImpl();

    @Test
    void toPost_trimsTitleAndContent() {
        User user = new User("john", "john@mail.com", "hashed");
        Topic topic = new Topic("Java", "desc");
        PostRequest request = new PostRequest(1L, "  My title  ", "  My content  ");

        Post post = postMapper.toPost(request, user, topic);

        assertThat(post.getTitle()).isEqualTo("My title");
        assertThat(post.getContent()).isEqualTo("My content");
        assertThat(post.getUser()).isEqualTo(user);
        assertThat(post.getTopic()).isEqualTo(topic);
    }

    @Test
    void toPostFeedResponse_nullPost_returnsNull() {
        assertThat(postMapper.toPostFeedResponse(null)).isNull();
    }

    @Test
    void toPostFeedResponse_mapsAuthorAndDate() {
        User user = new User("john", "john@mail.com", "hashed");
        Topic topic = new Topic("Java", "desc");
        Post post = new Post("title", "content", topic, user);

        PostFeedResponse response = postMapper.toPostFeedResponse(post);

        assertThat(response.title()).isEqualTo("title");
        assertThat(response.name()).isEqualTo("john");
        assertThat(response.content()).isEqualTo("content");
    }

    @Test
    void toPostResponse_mapsTopicNameAndComments() {
        User user = new User("john", "john@mail.com", "hashed");
        Topic topic = new Topic("Java", "desc");
        Post post = new Post("title", "content", topic, user);
        List<CommentResponse> comments = List.of(new CommentResponse("john", "hi"));

        PostResponse response = postMapper.toPostResponse(post, comments);

        assertThat(response.title()).isEqualTo("title");
        assertThat(response.name()).isEqualTo("john");
        assertThat(response.topicName()).isEqualTo("Java");
        assertThat(response.comments()).isEqualTo(comments);
    }

    @Test
    void toPostResponse_nullPost_returnsResponseWithNullFields() {
        PostResponse response = postMapper.toPostResponse(null, List.of());

        assertThat(response.id()).isNull();
        assertThat(response.title()).isNull();
        assertThat(response.comments()).isEmpty();
    }
}
