package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.model.Topic;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class TopicMapperTest {

    private final TopicMapper topicMapper = new TopicMapperImpl();

    private static void setId(Object entity, Long id) throws Exception {
        Field field = entity.getClass().getSuperclass().getDeclaredField("id");
        field.setAccessible(true);
        field.set(entity, id);
    }

    @Test
    void toTopicResponse_nullTopic_returnsNull() {
        assertThat(topicMapper.toTopicResponse((Topic) null, Set.of(5L))).isNull();
    }

    @Test
    void toTopicResponseList_nullList_returnsNull() {
        assertThat(topicMapper.toTopicResponse((List<Topic>) null, Set.of(5L))).isNull();
    }

    @Test
    void toTopicResponse_subscribedUser_returnsTrue() throws Exception {
        Topic topic = new Topic("Java", "desc");
        setId(topic, 1L);

        TopicResponse response = topicMapper.toTopicResponse(topic, Set.of(1L));

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo("Java");
        assertThat(response.subscribed()).isTrue();
    }

    @Test
    void toTopicResponse_notSubscribedUser_returnsFalse() throws Exception {
        Topic topic = new Topic("Java", "desc");
        setId(topic, 1L);

        TopicResponse response = topicMapper.toTopicResponse(topic, Set.of(99L));

        assertThat(response.subscribed()).isFalse();
    }

    @Test
    void toTopicResponseList_mapsEachTopic() throws Exception {
        Topic topic = new Topic("Java", "desc");
        setId(topic, 1L);

        List<TopicResponse> responses = topicMapper.toTopicResponse(List.of(topic), Set.of(5L));

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).title()).isEqualTo("Java");
    }

    @Test
    void isSubscribed_checksIdMembership() throws Exception {
        Topic topic = new Topic("Java", "desc");
        setId(topic, 1L);

        assertThat(topicMapper.isSubscribed(topic, Set.of(1L))).isTrue();
        assertThat(topicMapper.isSubscribed(topic, Set.of(2L))).isFalse();
    }
}
