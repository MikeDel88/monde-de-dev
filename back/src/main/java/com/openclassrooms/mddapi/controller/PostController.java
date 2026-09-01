package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.documentation.post.ApiFeedResponse;
import com.openclassrooms.mddapi.documentation.post.ApiFeedValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostCreateResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostCreateValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostDetailResponse;
import com.openclassrooms.mddapi.documentation.post.ApiPostDetailValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiTopicNotFoundResponse;
import com.openclassrooms.mddapi.documentation.user.ApiUserNotFoundResponse;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Log4j2
@AllArgsConstructor
@RestController
public class PostController {

    private final PostService postService;

    @ApiFeedResponse
    @ApiFeedValidationErrorResponse
    @ApiUserNotFoundResponse
    @GetMapping("/feed")
    public List<PostFeedResponse> feed(
            @Validated
            @RequestParam
            @NotBlank(message = "SORT_REQUIRED")
            @Pattern(regexp = "^(asc|desc)$", message = "SORT_INVALID")
            String sort,
            Principal principal
    ) {
        log.info("call /feed");
        return postService.getPosts(sort, Long.valueOf(principal.getName()));
    }

    @ApiPostDetailResponse
    @ApiPostDetailValidationErrorResponse
    @ApiTopicNotFoundResponse
    @ApiUserNotFoundResponse
    @GetMapping("/posts/{postId}")
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
    @PostMapping("/posts")
    public ResponseEntity<Void> create(@Valid @RequestBody PostRequest postRequest, Principal principal) {
        log.info("call /posts create");
        this.postService.createPost(postRequest, Long.valueOf(principal.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
