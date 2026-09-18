package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.exception.TopicNotFoundException;
import com.openclassrooms.mddapi.exception.UserNotFoundException;
import com.openclassrooms.mddapi.mapper.TopicMapper;
import com.openclassrooms.mddapi.model.Topic;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.TopicRepository;
import com.openclassrooms.mddapi.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TopicServiceImplTest {

    @Mock
    private TopicRepository topicRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TopicMapper topicMapper;

    @InjectMocks
    private TopicServiceImpl topicService;

    private static void setId(Object entity, Long id) throws Exception {
        Field field = entity.getClass().getSuperclass().getDeclaredField("id");
        field.setAccessible(true);
        field.set(entity, id);
    }

    @Test
    void getTopics_returnsMappedList() {
        Topic topic = new Topic("Java", "desc");
        List<Topic> topics = List.of(topic);
        when(topicRepository.findAll(Sort.by("title"))).thenReturn(topics);
        when(userRepository.findSubscribedTopicIds(5L)).thenReturn(Set.of());
        List<TopicResponse> expected = List.of(new TopicResponse(1L, "Java", "desc", false));
        when(topicMapper.toTopicResponse(topics, Set.of())).thenReturn(expected);

        List<TopicResponse> result = topicService.getTopics(5L);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void subscribe_topicNotFound_throws() {
        when(topicRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> topicService.subscribe(1L, 5L))
                .isInstanceOf(TopicNotFoundException.class);
    }

    @Test
    void subscribe_userNotFound_throws() throws Exception {
        Topic topic = new Topic("Java", "desc");
        setId(topic, 1L);
        when(topicRepository.findById(1L)).thenReturn(Optional.of(topic));
        when(userRepository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> topicService.subscribe(1L, 5L))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void subscribe_addsUserToTopic() throws Exception {
        Topic topic = new Topic("Java", "desc");
        setId(topic, 1L);
        User user = new User("john", "john@mail.com", "hashed");
        setId(user, 5L);
        when(topicRepository.findById(1L)).thenReturn(Optional.of(topic));
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        topicService.subscribe(1L, 5L);

        assertThat(user.getTopics()).contains(topic);
        assertThat(topic.getUsers()).contains(user);
    }

    @Test
    void unsubscribe_topicNotFound_throws() {
        when(topicRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> topicService.unsubscribe(1L, 5L))
                .isInstanceOf(TopicNotFoundException.class);
    }

    @Test
    void unsubscribe_removesUserFromTopic() throws Exception {
        Topic topic = new Topic("Java", "desc");
        setId(topic, 1L);
        User user = new User("john", "john@mail.com", "hashed");
        setId(user, 5L);
        user.subscribeTo(topic);
        when(topicRepository.findById(1L)).thenReturn(Optional.of(topic));
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        topicService.unsubscribe(1L, 5L);

        assertThat(user.getTopics()).doesNotContain(topic);
        assertThat(topic.getUsers()).doesNotContain(user);
    }
}
