package com.openclassrooms.mddapi.controller;

import java.security.Principal;
import java.util.List;

import com.openclassrooms.mddapi.documentation.topic.ApiSubscribeValidResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiSubscribeValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiTopicListResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiTopicNotFoundResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiUnsubscribeValidResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiUnsubscribeValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.user.ApiUserNotFoundResponse;
import com.openclassrooms.mddapi.dto.request.SubscribeRequest;
import com.openclassrooms.mddapi.exception.ErrorCodes;
import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.config.security.PrincipalUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.openclassrooms.mddapi.service.TopicService;

@RestController
@AllArgsConstructor
@RequestMapping("/topics")
public class TopicController {

    private final TopicService topicService;

    @ApiTopicListResponse
    @GetMapping
    public List<TopicResponse> getTopics(Principal principal) {
        return topicService.getTopics(PrincipalUtils.userId(principal));
    }

    @ApiSubscribeValidResponse
    @ApiSubscribeValidationErrorResponse
    @ApiTopicNotFoundResponse
    @ApiUserNotFoundResponse
    @PostMapping("/subscribe")
    public void subscribe(@Valid @RequestBody SubscribeRequest request, Principal principal) {
        topicService.subscribe(request.topicId(), PrincipalUtils.userId(principal));
    }

    @ApiUnsubscribeValidResponse
    @ApiUnsubscribeValidationErrorResponse
    @ApiTopicNotFoundResponse
    @ApiUserNotFoundResponse
    @DeleteMapping("/{topicId}/subscribe")
    public void unsubscribe(@Validated @Positive(message = ErrorCodes.TOPIC_POSITIVE) @PathVariable Long topicId, Principal principal) {
        topicService.unsubscribe(topicId, PrincipalUtils.userId(principal));
    }
}
