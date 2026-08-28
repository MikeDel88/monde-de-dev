package com.openclassrooms.mddapi.controller;

import java.security.Principal;
import java.util.List;

import com.openclassrooms.mddapi.documentation.topic.*;
import com.openclassrooms.mddapi.documentation.user.ApiUserNotFoundResponse;
import com.openclassrooms.mddapi.dto.request.SubscribeRequest;
import com.openclassrooms.mddapi.dto.response.TopicResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.openclassrooms.mddapi.service.TopicService;

@RestController
@AllArgsConstructor
@RequestMapping("/topics")
public class TopicController {

	private TopicService topicService;

	@ApiTopicListResponse
	@GetMapping
	public List<TopicResponse> getTopics(
			Principal principal
	) {
		return topicService.getTopics(Long.valueOf(principal.getName()));
	}

	@ApiSubscribeValidResponse
	@ApiSubscribeValidationErrorResponse
	@ApiTopicNotFoundResponse
	@ApiUserNotFoundResponse
	@PostMapping("/subscribe")
	public void subscribe(@Valid @RequestBody SubscribeRequest request, Principal principal) {
		topicService.subscribe(request.topicId(), Long.valueOf(principal.getName()));
	}

	@ApiUnsubscribeValidResponse
	@ApiUnsubscribeValidationErrorResponse
	@ApiTopicNotFoundResponse
	@ApiUserNotFoundResponse
	@DeleteMapping("/{topicId}/subscribe")
	public void unsubscribe(@Validated @Positive @PathVariable Long topicId, Principal principal) {
		topicService.unsubscribe(topicId, Long.valueOf(principal.getName()));
	}
}
