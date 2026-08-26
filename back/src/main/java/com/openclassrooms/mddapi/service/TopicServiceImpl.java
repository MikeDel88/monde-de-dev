package com.openclassrooms.mddapi.service;

import java.util.List;

import com.openclassrooms.mddapi.dto.response.TopicReponse;
import com.openclassrooms.mddapi.mapper.TopicMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.repository.TopicRepository;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@AllArgsConstructor
public class TopicServiceImpl implements TopicService {

	private TopicRepository topicRepository;
	private TopicMapper topicMapper;

	@Override
	@Transactional(readOnly = true)
	public List<TopicReponse> getTopics(Long userId) {
		log.info("service: getTopics");

		List<Topic> topics = topicRepository.findAll();
		log.info("topics: {}", topics.size());

        return topicMapper.toTopicResponse(topics, userId);
	}
	
}
