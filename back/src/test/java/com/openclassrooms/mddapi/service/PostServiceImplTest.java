package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.CommentRequest;
import com.openclassrooms.mddapi.dto.request.PostRequest;
import com.openclassrooms.mddapi.dto.response.CommentResponse;
import com.openclassrooms.mddapi.dto.response.CursorPageResponse;
import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.dto.response.PostResponse;
import com.openclassrooms.mddapi.exception.TopicNotSubscribedException;
import com.openclassrooms.mddapi.exception.UserNotFoundException;
import com.openclassrooms.mddapi.mapper.CommentMapper;
import com.openclassrooms.mddapi.mapper.PostMapper;
import com.openclassrooms.mddapi.model.Comment;
import com.openclassrooms.mddapi.model.Post;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.PostRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PostRepository postRepository;
    @Mock
    private PostMapper postMapper;
    @Mock
    private CommentMapper commentMapper;

    @InjectMocks
    private PostServiceImpl postService;

    private static void setId(Object entity, Long id) throws Exception {
        Field field = entity.getClass().getSuperclass().getDeclaredField("id");
        field.setAccessible(true);
        field.set(entity, id);
    }

    private User userWithTopics(Long id, Topic... topics) throws Exception {
        User user = new User("john", "john@mail.com", "hashed");
        setId(user, id);
        for (Topic topic : topics) {
            user.subscribeTo(topic);
        }
        return user;
    }

    private Topic topic(Long id) throws Exception {
        Topic topic = new Topic("Java", "desc");
        setId(topic, id);
        return topic;
    }

    @Test
    void getPosts_userNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.getPosts(null, "desc", 1L))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void getPosts_descending_returnsHasNextWhenFull() throws Exception {
        Topic topic = topic(1L);
        User user = userWithTopics(1L, topic);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        List<Post> posts = fullPageOfPosts(topic, user);
        when(postRepository.fetchNextPageDesc(eq(user.getTopics()), eq(5L), any())).thenReturn(posts);
        when(postMapper.toPostFeedResponse(any())).thenReturn(
                new PostFeedResponse(1L, "t", null, "john", "c"));

        CursorPageResponse<PostFeedResponse> result = postService.getPosts(5L, "desc", 1L);

        assertThat(result.hasNext()).isTrue();
        assertThat(result.content()).hasSize(20);
        assertThat(result.nextCursor()).isEqualTo(posts.get(19).getId());
        verify(postRepository, never()).fetchNextPageAsc(any(), any(), any());
    }

    @Test
    void getPosts_ascending_returnsNoNextWhenNotFull() throws Exception {
        Topic topic = topic(1L);
        User user = userWithTopics(1L, topic);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Post post = new Post("t", "c", topic, user);
        setId(post, 10L);
        when(postRepository.fetchNextPageAsc(eq(user.getTopics()), eq(null), any())).thenReturn(List.of(post));
        when(postMapper.toPostFeedResponse(post)).thenReturn(new PostFeedResponse(10L, "t", null, "john", "c"));

        CursorPageResponse<PostFeedResponse> result = postService.getPosts(null, "asc", 1L);

        assertThat(result.hasNext()).isFalse();
        assertThat(result.nextCursor()).isNull();
        assertThat(result.content()).hasSize(1);
    }

    private List<Post> fullPageOfPosts(Topic topic, User user) throws Exception {
        java.util.ArrayList<Post> posts = new java.util.ArrayList<>();
        for (int i = 0; i < 20; i++) {
            Post post = new Post("t" + i, "c" + i, topic, user);
            setId(post, (long) (i + 1));
            posts.add(post);
        }
        return posts;
    }

    @Test
    void createPost_userNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        PostRequest request = new PostRequest(1L, "title", "content");

        assertThatThrownBy(() -> postService.createPost(request, 1L))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void createPost_topicNotSubscribed_throws() throws Exception {
        User user = userWithTopics(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        PostRequest request = new PostRequest(99L, "title", "content");

        assertThatThrownBy(() -> postService.createPost(request, 1L))
                .isInstanceOf(TopicNotSubscribedException.class);
        verify(postRepository, never()).save(any());
    }

    @Test
    void createPost_subscribedTopic_savesPost() throws Exception {
        Topic topic = topic(2L);
        User user = userWithTopics(1L, topic);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        PostRequest request = new PostRequest(2L, "title", "content");
        Post mappedPost = new Post("title", "content", topic, user);
        when(postMapper.toPost(request, user, topic)).thenReturn(mappedPost);

        postService.createPost(request, 1L);

        verify(postRepository).save(mappedPost);
    }

    @Test
    void getPostById_userNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.getPostById(5L, 1L))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void getPostById_postNotFoundOrNotSubscribed_throws() throws Exception {
        User user = userWithTopics(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(postRepository.findByIdAndTopicIn(5L, eq(user.getTopics()))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.getPostById(5L, 1L))
                .isInstanceOf(TopicNotSubscribedException.class);
    }

    @Test
    void getPostById_returnsMappedResponse() throws Exception {
        Topic topic = topic(2L);
        User user = userWithTopics(1L, topic);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        Post post = new Post("title", "content", topic, user);
        setId(post, 5L);
        when(postRepository.findByIdAndTopicIn(5L, eq(user.getTopics()))).thenReturn(Optional.of(post));
        List<CommentResponse> comments = List.of(new CommentResponse("john", "hi"));
        when(commentMapper.toCommentResponseList(post.getComments())).thenReturn(comments);
        PostResponse expected = new PostResponse(5L, "title", null, "john", "Java", "content", comments);
        when(postMapper.toPostResponse(post, comments)).thenReturn(expected);

        PostResponse result = postService.getPostById(5L, 1L);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void createComment_userNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        CommentRequest request = new CommentRequest("hi");

        assertThatThrownBy(() -> postService.createComment(5L, request, 1L))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void createComment_postNotFoundOrNotSubscribed_throws() throws Exception {
        User user = userWithTopics(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(postRepository.findByIdAndTopicIn(5L, user.getTopics())).thenReturn(Optional.empty());
        CommentRequest request = new CommentRequest("hi");

        assertThatThrownBy(() -> postService.createComment(5L, request, 1L))
                .isInstanceOf(TopicNotSubscribedException.class);
    }

    @Test
    void createComment_addsCommentAndSavesPost() throws Exception {
        Topic topic = topic(2L);
        User user = userWithTopics(1L, topic);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        Post post = new Post("title", "content", topic, user);
        setId(post, 5L);
        when(postRepository.findByIdAndTopicIn(5L, user.getTopics())).thenReturn(Optional.of(post));
        CommentRequest request = new CommentRequest("hi");
        Comment comment = new Comment("hi", post, user);
        when(commentMapper.toComment(request, user, post)).thenReturn(comment);

        postService.createComment(5L, request, 1L);

        assertThat(post.getComments()).contains(comment);
        verify(postRepository).save(post);
    }
}
