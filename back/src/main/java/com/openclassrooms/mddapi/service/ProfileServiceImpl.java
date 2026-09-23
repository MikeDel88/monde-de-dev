package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.UpdateProfileRequest;
import com.openclassrooms.mddapi.dto.response.ProfileResponse;
import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.exception.InvalidCurrentPasswordException;
import com.openclassrooms.mddapi.exception.UserNotFoundException;
import com.openclassrooms.mddapi.mapper.TopicMapper;
import com.openclassrooms.mddapi.mapper.UserMapper;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implémentation de {@link ProfileService} : construit le profil de l'utilisateur connecté
 * à partir de ses informations et de ses thèmes abonnés.
 */
@AllArgsConstructor
@Service
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final TopicMapper topicMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
        return this.toProfileResponse(user);
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new InvalidCurrentPasswordException();
        }

        if (request.name() != null) {
            user.changeName(request.name().trim());
        }
        if (request.email() != null) {
            user.changeEmail(request.email().trim().toLowerCase(Locale.ROOT));
        }

        if(request.newPassword() != null) {
            user.changePassword(passwordEncoder.encode(request.newPassword()));
        }

        return this.toProfileResponse(user);
    }

    private ProfileResponse toProfileResponse(User user) {
        List<Topic> sortedTopics = user.getTopics().stream()
                .sorted(Comparator.comparing(Topic::getTitle))
                .toList();
        Set<Long> subscribedTopicIds = sortedTopics.stream().map(Topic::getId).collect(Collectors.toSet());
        List<TopicResponse> topics = topicMapper.toTopicResponse(sortedTopics, subscribedTopicIds);
        return userMapper.toProfileResponse(user, topics);
    }
}
