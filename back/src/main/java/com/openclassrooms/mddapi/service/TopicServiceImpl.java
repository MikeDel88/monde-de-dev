package com.openclassrooms.mddapi.service;

import java.util.List;
import java.util.Set;

import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.exception.TopicNotFoundException;
import com.openclassrooms.mddapi.exception.UserNotFoundException;
import com.openclassrooms.mddapi.mapper.TopicMapper;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Sort;
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
@Log4j2
@Service
@AllArgsConstructor
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final TopicMapper topicMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TopicResponse> getTopics(Long userId) {
        log.info("service: getTopics");

        List<Topic> topics = topicRepository.findAll(Sort.by("title"));
        log.info("topics: {}", topics.size());

        Set<Long> subscribedTopicIds = userRepository.findSubscribedTopicIds(userId);
        return topicMapper.toTopicResponse(topics, subscribedTopicIds);
    }

    @Override
    @Transactional
    public void subscribe(Long topicId, Long userId) {
        log.info("service: subscribe");
        addOrRemoveSubscription(topicId, userId, true);
    }

    @Override
    @Transactional
    public void unsubscribe(Long topicId, Long userId) {
        log.info("service: unsubscribe");
        addOrRemoveSubscription(topicId, userId, false);
    }

    private void addOrRemoveSubscription(Long topicId, Long userId, boolean addSubscription) {
        Topic topic = topicRepository.findById(topicId).orElseThrow(TopicNotFoundException::new);
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

        if (addSubscription) {
            user.subscribeTo(topic);
        } else {
            user.unsubscribeFrom(topic);
        }
    }

}
