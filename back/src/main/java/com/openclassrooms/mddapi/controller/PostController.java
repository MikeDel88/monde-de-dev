package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.service.PostService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@Log4j2
@AllArgsConstructor
@RestController
public class PostController {

    private PostService postService;

    @GetMapping("/feed")
    public List<PostFeedResponse> feed(
            @RequestParam
            @NotBlank(message = "SORT_REQUIRED")
            @Pattern(regexp = "^(asc|desc)$", message = "SORT_INVALID")
            String sort,
            Principal principal
    ) {
        log.info("call /feed");
        return postService.getPosts(sort, Long.valueOf(principal.getName()));
    }
}
