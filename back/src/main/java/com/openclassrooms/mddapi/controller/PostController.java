package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.documentation.comment.ApiCommentCreateResponse;
import com.openclassrooms.mddapi.documentation.comment.ApiCommentCreateValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.post.ApiFeedResponse;
import com.openclassrooms.mddapi.documentation.post.ApiFeedValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostCreateResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostCreateValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostDetailResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostDetailValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiTopicNotSubscribedResponse;
import com.openclassrooms.mddapi.documentation.user.ApiUserNotFoundResponse;
import com.openclassrooms.mddapi.dto.request.CommentRequest;
import com.openclassrooms.mddapi.dto.request.PostRequest;
import com.openclassrooms.mddapi.exception.ErrorCodes;
import com.openclassrooms.mddapi.dto.response.CursorPageResponse;
import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.dto.response.PostResponse;
import com.openclassrooms.mddapi.service.PostService;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

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
    public CursorPageResponse<PostFeedResponse> posts(
            Principal principal,
            @Parameter(description = "Id du dernier post reçu par le client, absent pour la première page.")
            @Validated
            @Positive(message = ErrorCodes.CURSOR_POSITIVE)
            @RequestParam(required = false) Long cursor,
            @Parameter(description = "Sens du tri du fil d'actualité (par id).")
            @Validated
            @Pattern(regexp = "^(asc|desc)$", message = ErrorCodes.DIRECTION_INVALID)
            @RequestParam(defaultValue = "desc") String direction
    ) {
        log.info("call /posts");
        return postService.getPosts(cursor, direction, Long.valueOf(principal.getName()));
    }

    @ApiPostDetailResponse
    @ApiPostDetailValidationErrorResponse
    @ApiTopicNotSubscribedResponse
    @ApiUserNotFoundResponse
    @GetMapping("/{postId}")
    public PostResponse getPost(
            @Validated @Positive(message = ErrorCodes.POST_ID_POSITIVE) @PathVariable Long postId,
            Principal principal) {
        log.info("call /posts/{}", postId);
        return postService.getPostById(postId, Long.valueOf(principal.getName()));
    }

    @ApiPostCreateResponse
    @ApiPostCreateValidationErrorResponse
    @ApiTopicNotSubscribedResponse
    @ApiUserNotFoundResponse
    @PostMapping
    public ResponseEntity<Void> create(@Valid @RequestBody PostRequest postRequest, Principal principal) {
        log.info("call /posts create");
        this.postService.createPost(postRequest, Long.valueOf(principal.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @ApiCommentCreateResponse
    @ApiCommentCreateValidationErrorResponse
    @ApiTopicNotSubscribedResponse
    @ApiUserNotFoundResponse
    @PostMapping("/{postId}/comments")
    public ResponseEntity<Void> createComment(
            @Validated @Positive(message = ErrorCodes.POST_ID_POSITIVE) @PathVariable Long postId,
            @Valid @RequestBody CommentRequest commentRequest,
            Principal principal) {
        log.info("call /posts/{}/comments create", postId);
        this.postService.createComment(postId, commentRequest, Long.valueOf(principal.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
