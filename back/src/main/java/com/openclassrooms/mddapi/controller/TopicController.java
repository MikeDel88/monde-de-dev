package com.openclassrooms.mddapi.controller;

import java.security.Principal;
import java.util.List;

import com.openclassrooms.mddapi.documentation.topic.ApiSubscribeValidResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiSubscribeValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiTopicListResponse;
import com.openclassrooms.mddapi.documentation.topic.ApiTopicNotFoundResponse;
import com.openclassrooms.mddapi.documentation.user.ApiUserNotFoundResponse;
import com.openclassrooms.mddapi.dto.request.SubscribeRequest;
import com.openclassrooms.mddapi.dto.response.TopicReponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.openclassrooms.mddapi.service.TopicService;

@RestController
@AllArgsConstructor
@RequestMapping("/topics")
public class TopicController {

	private TopicService topicService;

	@ApiTopicListResponse
	@GetMapping
	public List<TopicReponse> getTopics(
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
}
