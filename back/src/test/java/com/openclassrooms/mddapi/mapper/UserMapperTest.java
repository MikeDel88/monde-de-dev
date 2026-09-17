package com.openclassrooms.mddapi.mapper;

import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.dto.response.ProfileResponse;
import com.openclassrooms.mddapi.dto.response.TopicResponse;
import com.openclassrooms.mddapi.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class UserMapperTest {

    private final UserMapper userMapper = new UserMapperImpl();

    @Test
    void toUser_trimsAndLowercasesEmailAndEncodesPassword() {
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(passwordEncoder.encode("Passw0rd!")).thenReturn("hashed");
        RegisterRequest request = new RegisterRequest("  John  ", "  John@Mail.com  ", "Passw0rd!");

        User user = userMapper.toUser(request, passwordEncoder);

        assertThat(user.getName()).isEqualTo("John");
        assertThat(user.getEmail()).isEqualTo("john@mail.com");
        assertThat(user.getPassword()).isEqualTo("hashed");
    }

    @Test
    void toProfilResponse_nullUser_returnsResponseWithNullFields() {
        ProfileResponse response = userMapper.toProfilResponse(null, List.of());

        assertThat(response.name()).isNull();
        assertThat(response.email()).isNull();
        assertThat(response.topics()).isEmpty();
    }

    @Test
    void toProfilResponse_nullTopics_returnsResponseWithNullTopics() {
        User user = new User("john", "john@mail.com", "hashed");

        ProfileResponse response = userMapper.toProfilResponse(user, null);

        assertThat(response.name()).isEqualTo("john");
        assertThat(response.topics()).isNull();
    }

    @Test
    void toProfilResponse_mapsUserAndTopics() {
        User user = new User("john", "john@mail.com", "hashed");
        List<TopicResponse> topics = List.of(new TopicResponse(1L, "Java", "desc", true));

        ProfileResponse response = userMapper.toProfilResponse(user, topics);

        assertThat(response.name()).isEqualTo("john");
        assertThat(response.email()).isEqualTo("john@mail.com");
        assertThat(response.topics()).isEqualTo(topics);
    }
}
