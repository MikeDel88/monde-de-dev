package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.request.CommentRequest;
import com.openclassrooms.mddapi.dto.response.CommentResponse;
import com.openclassrooms.mddapi.model.Comment;
import com.openclassrooms.mddapi.model.Post;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CommentMapperTest {

    private final CommentMapper commentMapper = new CommentMapperImpl();

    @Test
    void toComment_trimsContentAndSetsAuthorAndPost() {
        User user = new User("john", "john@mail.com", "hashed");
        Post post = new Post("title", "content", new Topic("Java", "desc"), user);

        Comment comment = commentMapper.toComment(new CommentRequest("  hello  "), user, post);

        assertThat(comment.getContent()).isEqualTo("hello");
        assertThat(comment.getUser()).isEqualTo(user);
        assertThat(comment.getPost()).isEqualTo(post);
    }

    @Test
    void toCommentResponse_nullComment_returnsNull() {
        assertThat(commentMapper.toCommentResponse(null)).isNull();
    }

    @Test
    void toCommentResponse_mapsAuthorFromUserName() {
        User user = new User("john", "john@mail.com", "hashed");
        Post post = new Post("title", "content", new Topic("Java", "desc"), user);
        Comment comment = new Comment("hi there", post, user);

        CommentResponse response = commentMapper.toCommentResponse(comment);

        assertThat(response.author()).isEqualTo("john");
        assertThat(response.content()).isEqualTo("hi there");
    }

    @Test
    void toCommentResponseList_mapsEachComment() {
        User user = new User("john", "john@mail.com", "hashed");
        Post post = new Post("title", "content", new Topic("Java", "desc"), user);
        Comment comment = new Comment("hi", post, user);

        List<CommentResponse> responses = commentMapper.toCommentResponseList(List.of(comment));

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).author()).isEqualTo("john");
    }

    @Test
    void toCommentResponseList_null_returnsNull() {
        assertThat(commentMapper.toCommentResponseList(null)).isNull();
    }
}
