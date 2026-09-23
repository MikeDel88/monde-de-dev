package com.openclassrooms.mddapi.model;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;

class BaseEntityTest {

    private static void setId(BaseEntity entity, Long id) throws Exception {
        Field field = BaseEntity.class.getDeclaredField("id");
        field.setAccessible(true);
        field.set(entity, id);
    }

    @Test
    void equals_sameInstance_isTrue() {
        Topic topic = new Topic("Java", "desc");

        assertThat(topic).isEqualTo(topic);
    }

    @Test
    void equals_null_isFalse() {
        Topic topic = new Topic("Java", "desc");

        assertThat(topic).isNotEqualTo(null);
    }

    @Test
    void equals_differentClass_isFalse() {
        Topic topic = new Topic("Java", "desc");
        User user = new User("john", "john@mail.com", "hashed");

        assertThat(topic).isNotEqualTo(user);
    }

    @Test
    void equals_bothTransient_isFalse() {
        Topic topic1 = new Topic("Java", "desc");
        Topic topic2 = new Topic("Web", "desc");

        assertThat(topic1).isNotEqualTo(topic2);
    }

    @Test
    void equals_sameId_isTrue() throws Exception {
        Topic topic1 = new Topic("Java", "desc");
        setId(topic1, 1L);
        Topic topic2 = new Topic("Web", "desc");
        setId(topic2, 1L);

        assertThat(topic1).isEqualTo(topic2);
    }

    @Test
    void equals_differentId_isFalse() throws Exception {
        Topic topic1 = new Topic("Java", "desc");
        setId(topic1, 1L);
        Topic topic2 = new Topic("Java", "desc");
        setId(topic2, 2L);

        assertThat(topic1).isNotEqualTo(topic2);
    }

    @Test
    void hashCode_isStableAcrossIdAssignment() throws Exception {
        Topic topic = new Topic("Java", "desc");
        int hashBeforeId = topic.hashCode();
        setId(topic, 1L);

        assertThat(topic.hashCode()).isEqualTo(hashBeforeId);
    }

    @Test
    void hashCode_isSameForSameClass() {
        Topic topic1 = new Topic("Java", "desc");
        Topic topic2 = new Topic("Web", "desc");

        assertThat(topic1.hashCode()).hasSameHashCodeAs(topic2.hashCode());
    }
}
