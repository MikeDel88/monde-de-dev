package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.documentation.comment.ApiCommentCreateResponse;
import com.openclassrooms.mddapi.documentation.comment.ApiCommentCreateValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.post.ApiFeedResponse;
import com.openclassrooms.mddapi.documentation.post.ApiFeedValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostCreateResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostCreateValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostDetailResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostDetailValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostNotFoundResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiTopicNotFoundResponse;
import com.openclassrooms.mddapi.documentation.user.ApiUserNotFoundResponse;
import com.openclassrooms.mddapi.dto.request.CommentRequest;
import com.openclassrooms.mddapi.dto.request.PostRequest;
import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.dto.response.PostResponse;
import com.openclassrooms.mddapi.service.PostService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Log4j2
@AllArgsConstructor
@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    @ApiFeedResponse
    @ApiFeedValidationErrorResponse
    @ApiUserNotFoundResponse
    @GetMapping
    public Page<PostFeedResponse> posts(
            @Validated
            @RequestParam
            @NotBlank(message = "SORT_REQUIRED")
            @Pattern(regexp = "^(asc|desc)$", message = "SORT_INVALID")
            String sort,
            Principal principal,
            @PageableDefault(size = 20)
            Pageable pageable
    ) {
        log.info("call /posts");
        return postService.getPosts(pageable, sort, Long.valueOf(principal.getName()));
    }

    @ApiPostDetailResponse
    @ApiPostDetailValidationErrorResponse
    @ApiPostNotFoundResponse
    @ApiUserNotFoundResponse
    @GetMapping("/{postId}")
    public PostResponse getPost(
            @Validated @Positive @PathVariable Long postId,
            Principal principal) {
        log.info("call /posts/{}", postId);
        return postService.getPostById(postId, Long.valueOf(principal.getName()));
    }

    @ApiPostCreateResponse
    @ApiPostCreateValidationErrorResponse
    @ApiTopicNotFoundResponse
    @ApiUserNotFoundResponse
    @PostMapping
    public ResponseEntity<Void> create(@Valid @RequestBody PostRequest postRequest, Principal principal) {
        log.info("call /posts create");
        this.postService.createPost(postRequest, Long.valueOf(principal.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @ApiCommentCreateResponse
    @ApiCommentCreateValidationErrorResponse
    @ApiPostNotFoundResponse
    @ApiUserNotFoundResponse
    @PostMapping("/{postId}/comments")
    public ResponseEntity<Void> createComment(
            @Validated @Positive @PathVariable Long postId,
            @Valid @RequestBody CommentRequest commentRequest,
            Principal principal) {
        log.info("call /posts/{}/comments create", postId);
        this.postService.createComment(postId, commentRequest, Long.valueOf(principal.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
