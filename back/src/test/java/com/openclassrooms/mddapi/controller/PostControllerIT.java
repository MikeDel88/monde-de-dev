package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.config.properties.AppConfigProperties;
import com.openclassrooms.mddapi.config.properties.RateLimitConfigProperties;
import com.openclassrooms.mddapi.config.properties.RsaConfigProperties;
import com.openclassrooms.mddapi.config.security.CookieBearerTokenResolver;
import com.openclassrooms.mddapi.config.security.JwtAccessDeniedHandler;
import com.openclassrooms.mddapi.config.security.JwtAuthenticationEntryPoint;
import com.openclassrooms.mddapi.config.security.KeyConfig;
import com.openclassrooms.mddapi.config.security.SecurityConfig;
import com.openclassrooms.mddapi.controller.support.ControllerTestSupport;
import com.openclassrooms.mddapi.dto.response.CursorPageResponse;
import com.openclassrooms.mddapi.dto.response.PostFeedResponse;
import com.openclassrooms.mddapi.dto.response.PostResponse;
import com.openclassrooms.mddapi.exception.ErrorCodes;
import com.openclassrooms.mddapi.exception.TopicNotSubscribedException;
import com.openclassrooms.mddapi.exception.UserNotFoundException;
import com.openclassrooms.mddapi.repository.UserRepository;
import com.openclassrooms.mddapi.service.PostService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = PostController.class)
@EnableWebSecurity
@Import({SecurityConfig.class, KeyConfig.class, CookieBearerTokenResolver.class,
        JwtAccessDeniedHandler.class, JwtAuthenticationEntryPoint.class})
@EnableConfigurationProperties({AppConfigProperties.class, RsaConfigProperties.class, RateLimitConfigProperties.class})
@ActiveProfiles("test")
class PostControllerIT extends ControllerTestSupport {

    @MockitoBean
    private PostService postService;
    @MockitoBean
    private UserRepository userRepository;

    @Test
    void posts_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/posts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void posts_authenticated_returnsFeed() throws Exception {
        CursorPageResponse<PostFeedResponse> page = new CursorPageResponse<>(
                List.of(new PostFeedResponse(1L, "title", null, "john", "content")), false, null);
        when(postService.getPosts(null, "desc", 7L)).thenReturn(page);

        mockMvc.perform(get("/posts").cookie(accessTokenCookie(7L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.hasNext").value(false));
    }

    @Test
    void posts_invalidDirection_returns400() throws Exception {
        mockMvc.perform(get("/posts").param("direction", "sideways").cookie(accessTokenCookie(7L)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void posts_negativeCursor_returns400() throws Exception {
        mockMvc.perform(get("/posts").param("cursor", "-1").cookie(accessTokenCookie(7L)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getPost_returnsPostDetail() throws Exception {
        PostResponse response = new PostResponse(5L, "title", null, "john", "Java", "content", List.of());
        when(postService.getPostById(5L, 7L)).thenReturn(response);

        mockMvc.perform(get("/posts/5").cookie(accessTokenCookie(7L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("title"));
    }

    @Test
    void getPost_negativeId_returns400() throws Exception {
        mockMvc.perform(get("/posts/-1").cookie(accessTokenCookie(7L)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getPost_notSubscribed_returns403() throws Exception {
        when(postService.getPostById(eq(5L), anyLong())).thenThrow(new TopicNotSubscribedException());

        mockMvc.perform(get("/posts/5").cookie(accessTokenCookie(7L)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value(ErrorCodes.TOPIC_NOT_SUBSCRIBED));
    }

    @Test
    void getPost_userNotFound_returns404() throws Exception {
        when(postService.getPostById(eq(5L), anyLong())).thenThrow(new UserNotFoundException());

        mockMvc.perform(get("/posts/5").cookie(accessTokenCookie(7L)))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_validRequest_returns201() throws Exception {
        String body = """
                {"topicId":1,"title":"title","content":"content"}
                """;

        mockMvc.perform(post("/posts")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        verify(postService).createPost(any(), eq(7L));
    }

    @Test
    void create_missingFields_returns400() throws Exception {
        String body = """
                {"topicId":null,"title":"","content":""}
                """;

        mockMvc.perform(post("/posts")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createComment_validRequest_returns201() throws Exception {
        String body = """
                {"content":"nice article"}
                """;

        mockMvc.perform(post("/posts/5/comments")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated());

        verify(postService).createComment(eq(5L), any(), eq(7L));
    }

    @Test
    void createComment_blankContent_returns400() throws Exception {
        String body = """
                {"content":""}
                """;

        mockMvc.perform(post("/posts/5/comments")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }
}
