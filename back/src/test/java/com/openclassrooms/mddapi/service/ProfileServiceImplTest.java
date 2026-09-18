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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private TopicMapper topicMapper;
    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfileServiceImpl profileService;

    private static void setId(Object entity, Long id) throws Exception {
        Field field = entity.getClass().getSuperclass().getDeclaredField("id");
        field.setAccessible(true);
        field.set(entity, id);
    }

    @Test
    void getProfile_userNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> profileService.getProfile(1L))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void getProfile_returnsMappedProfile() throws Exception {
        Topic topicB = new Topic("Web", "desc");
        setId(topicB, 2L);
        Topic topicA = new Topic("Android", "desc");
        setId(topicA, 1L);
        User user = new User("john", "john@mail.com", "hashed");
        setId(user, 1L);
        user.subscribeTo(topicB);
        user.subscribeTo(topicA);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        List<TopicResponse> topicResponses = List.of(new TopicResponse(1L, "Android", "desc", true));
        when(topicMapper.toTopicResponse(anyList(), eq(Set.of(1L, 2L)))).thenReturn(topicResponses);
        ProfileResponse expected = new ProfileResponse("john", "john@mail.com", topicResponses);
        when(userMapper.toProfileResponse(user, topicResponses)).thenReturn(expected);

        ProfileResponse result = profileService.getProfile(1L);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void updateProfile_userNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        UpdateProfileRequest request = new UpdateProfileRequest("New", null, null, "current");

        assertThatThrownBy(() -> profileService.updateProfile(1L, request))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void updateProfile_invalidCurrentPassword_throws() throws Exception {
        User user = new User("john", "john@mail.com", "hashed");
        setId(user, 1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);
        UpdateProfileRequest request = new UpdateProfileRequest("New", null, null, "wrong");

        assertThatThrownBy(() -> profileService.updateProfile(1L, request))
                .isInstanceOf(InvalidCurrentPasswordException.class);
    }

    @Test
    void updateProfile_updatesNameEmailAndPassword() throws Exception {
        User user = new User("john", "john@mail.com", "hashed");
        setId(user, 1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current", "hashed")).thenReturn(true);
        when(passwordEncoder.encode("NewPassw0rd!")).thenReturn("newHashed");
        when(topicMapper.toTopicResponse(anyList(), eq(Set.of()))).thenReturn(List.of());
        ProfileResponse expected = new ProfileResponse("New Name", "new@mail.com", List.of());
        when(userMapper.toProfileResponse(any(User.class), anyList())).thenReturn(expected);

        UpdateProfileRequest request = new UpdateProfileRequest(" New Name ", " New@Mail.com ", "NewPassw0rd!", "current");

        ProfileResponse result = profileService.updateProfile(1L, request);

        assertThat(user.getName()).isEqualTo("New Name");
        assertThat(user.getEmail()).isEqualTo("new@mail.com");
        assertThat(user.getPassword()).isEqualTo("newHashed");
        assertThat(result).isEqualTo(expected);
    }

    @Test
    void updateProfile_withNullFields_keepsExistingValues() throws Exception {
        User user = new User("john", "john@mail.com", "hashed");
        setId(user, 1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("current", "hashed")).thenReturn(true);
        when(topicMapper.toTopicResponse(anyList(), eq(Set.of()))).thenReturn(List.of());
        when(userMapper.toProfileResponse(any(User.class), anyList()))
                .thenReturn(new ProfileResponse("john", "john@mail.com", List.of()));

        UpdateProfileRequest request = new UpdateProfileRequest(null, null, null, "current");

        profileService.updateProfile(1L, request);

        assertThat(user.getName()).isEqualTo("john");
        assertThat(user.getEmail()).isEqualTo("john@mail.com");
        assertThat(user.getPassword()).isEqualTo("hashed");
        verify(passwordEncoder, never()).encode(any());
    }
}
