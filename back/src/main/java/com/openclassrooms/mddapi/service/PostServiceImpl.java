package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.CommentRequest;
import com.openclassrooms.mddapi.dto.request.PostRequest;
import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.dto.response.PostResponse;
import com.openclassrooms.mddapi.exception.TopicNotFoundException;
import com.openclassrooms.mddapi.exception.UserNotFoundException;
import com.openclassrooms.mddapi.mapper.CommentMapper;
import com.openclassrooms.mddapi.mapper.PostMapper;
import com.openclassrooms.mddapi.model.Comment;
import com.openclassrooms.mddapi.model.Post;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.PostRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

/**
 * Implémentation de {@link PostService} : construit le fil d'actualité d'un
 * utilisateur en agrégeant les posts de tous les topics auxquels il est
 * abonné, triés par date.
 */
@Log4j2
@AllArgsConstructor
@Service
public class PostServiceImpl implements PostService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final CommentMapper commentMapper;

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<PostFeedResponse> getPosts(String sort, Long userId) {
        log.info("service: getPosts");
        log.info("sort: {}", sort);
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

        Comparator<Post> comparator = Comparator.comparing(Post::getDate);
        if ("desc".equalsIgnoreCase(sort)) {
            comparator = comparator.reversed();
        }

        List<Post> posts = user
                .getTopics()
                .stream()
                .map(Topic::getPosts)
                .flatMap(Collection::stream)
                .sorted(comparator)
                .toList();
        log.debug("posts size: {}", posts.size());

        return this.postMapper.toPostFeedResponse(posts);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void createPost(PostRequest postRequest, Long userId) {
        log.info("service: createPost");
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        Topic topic = user
                .getTopics()
                .stream()
                .filter(t -> Objects.equals(t.getId(), postRequest.topicId()))
                .findFirst()
                .orElseThrow(TopicNotFoundException::new);
        Post newPost = postMapper.toPost(postRequest, user, topic);
        postRepository.save(newPost);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public PostResponse getPostById(Long postId, Long userId) {
        log.info("service: getPostById {}", postId);
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        Post post = postRepository.findById(postId).orElseThrow(TopicNotFoundException::new);

        // si l'utilisateur n'est pas abonné au topic du post, on lève une exception
        if(user.getTopics().stream().noneMatch(post.getTopic()::equals)) {
            throw new TopicNotFoundException();
        }

        // du plus ancien au plus récent, pour que le dernier commentaire soit en bas de la liste.
        List<Comment> comments = post.getComments()
                .stream()
                .sorted(Comparator.comparing(Comment::getDate).reversed())
                .toList();

        return postMapper.toPostResponse(post, commentMapper.toCommentResponseList(comments));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void createComment(Long postId, CommentRequest commentRequest, Long userId) {
        log.info("service: createComment");
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        Post post = postRepository.findById(postId).orElseThrow(TopicNotFoundException::new);

        // si l'utilisateur n'est pas abonné au topic du post, on lève une exception
        if(user.getTopics().stream().noneMatch(post.getTopic()::equals)) {
            throw new TopicNotFoundException();
        }

        Comment newComment = commentMapper.toComment(commentRequest, user, post);
        post.getComments().add(newComment);
        postRepository.save(post);
    }
}
