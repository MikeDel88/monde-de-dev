package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.response.ProfilResponse;
import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.exception.UserNotFoundException;
import com.openclassrooms.mddapi.mapper.TopicMapper;
import com.openclassrooms.mddapi.mapper.UserMapper;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
public class ProfilServiceImpl implements ProfilService {

    private UserRepository userRepository;
    private UserMapper userMapper;
    private TopicMapper topicMapper;

    @Override
    @Transactional(readOnly = true)
    public ProfilResponse getProfil(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

        List<TopicResponse> topics = topicMapper.toTopicResponse(user.getTopics().stream().toList(), userId);
        return userMapper.toProfilResponse(user, topics);
    }
}
