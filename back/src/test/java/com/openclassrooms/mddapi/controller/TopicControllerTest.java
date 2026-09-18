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
import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.exception.ErrorCodes;
import com.openclassrooms.mddapi.exception.TopicNotFoundException;
import com.openclassrooms.mddapi.repository.UserRepository;
import com.openclassrooms.mddapi.service.TopicService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TopicController.class)
@EnableWebSecurity
@Import({SecurityConfig.class, KeyConfig.class, CookieBearerTokenResolver.class,
        JwtAccessDeniedHandler.class, JwtAuthenticationEntryPoint.class})
@EnableConfigurationProperties({AppConfigProperties.class, RsaConfigProperties.class, RateLimitConfigProperties.class})
@ActiveProfiles("test")
class TopicControllerTest extends ControllerTestSupport {

    @MockitoBean
    private TopicService topicService;
    @MockitoBean
    private UserRepository userRepository;

    @Test
    void getTopics_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/topics"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getTopics_authenticated_returnsList() throws Exception {
        when(topicService.getTopics(7L)).thenReturn(List.of(new TopicResponse(1L, "Java", "desc", true)));

        mockMvc.perform(get("/topics").cookie(accessTokenCookie(7L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Java"))
                .andExpect(jsonPath("$[0].subscribed").value(true));
    }

    @Test
    void subscribe_validRequest_returns200() throws Exception {
        String body = """
                {"topicId":1}
                """;

        mockMvc.perform(post("/topics/subscribe")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        verify(topicService).subscribe(1L, 7L);
    }

    @Test
    void subscribe_topicNotFound_returns404() throws Exception {
        doThrow(new TopicNotFoundException()).when(topicService).subscribe(eq(1L), eq(7L));

        String body = """
                {"topicId":1}
                """;

        mockMvc.perform(post("/topics/subscribe")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value(ErrorCodes.TOPIC_NOT_FOUND));
    }

    @Test
    void subscribe_missingTopicId_returns400WithTopicRequired() throws Exception {
        String body = """
                {}
                """;

        mockMvc.perform(post("/topics/subscribe")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='topicId')].code").value(ErrorCodes.TOPIC_REQUIRED));
    }

    @Test
    void subscribe_zeroTopicId_returns400WithTopicPositive() throws Exception {
        String body = """
                {"topicId":0}
                """;

        mockMvc.perform(post("/topics/subscribe")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='topicId')].code").value(ErrorCodes.TOPIC_POSITIVE));
    }

    @Test
    void unsubscribe_validRequest_returns200() throws Exception {
        mockMvc.perform(delete("/topics/1/subscribe")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L)))
                .andExpect(status().isOk());

        verify(topicService).unsubscribe(1L, 7L);
    }

    @Test
    void unsubscribe_negativeId_returns400WithTopicPositive() throws Exception {
        mockMvc.perform(delete("/topics/-1/subscribe")
                        .with(csrf())
                        .cookie(accessTokenCookie(7L)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[?(@.field=='topicId')].code").value(ErrorCodes.TOPIC_POSITIVE));
    }
}
