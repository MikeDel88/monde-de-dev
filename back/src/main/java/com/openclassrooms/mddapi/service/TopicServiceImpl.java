package com.openclassrooms.mddapi.service;

import java.util.List;

import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.exception.TopicNotFoundException;
import com.openclassrooms.mddapi.exception.UserNotFoundException;
import com.openclassrooms.mddapi.mapper.TopicMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implémentation de {@link TopicService} : liste les topics et gère
 * l'abonnement d'un utilisateur à un topic.
 */
@Slf4j
@Service
@AllArgsConstructor
public class TopicServiceImpl implements TopicService {

	private TopicRepository topicRepository;
	private UserRepository userRepository;
	private TopicMapper topicMapper;

	@Override
	@Transactional(readOnly = true)
	public List<TopicResponse> getTopics(Long userId) {
		log.info("service: getTopics");

		List<Topic> topics = topicRepository.findAll();
		log.info("topics: {}", topics.size());

        return topicMapper.toTopicResponse(topics, userId);
	}

	@Override
	@Transactional
	public void subscribe(Long topicId, Long userId) {
		log.info("service: subscribe");

		Topic topic = topicRepository.findById(topicId).orElseThrow(TopicNotFoundException::new);
		User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

		user.getTopics().add(topic);
	}

	@Override
	@Transactional
	public void unsubscribe(Long topicId, Long userId) {
		log.info("service: unsubscribe");

		Topic topic = topicRepository.findById(topicId).orElseThrow(TopicNotFoundException::new);
		User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

		user.getTopics().remove(topic);
	}

}
