package com.openclassrooms.mddapi.config.security;

import com.openclassrooms.mddapi.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import static org.assertj.core.api.Assertions.assertThat;

class AuthenticatedUserTest {

    @Test
    void adaptsUserToUserDetails() {
        User user = new User("john", "john@mail.com", "hashed-password");
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(user);

        assertThat(authenticatedUser.getUsername()).isEqualTo("john@mail.com");
        assertThat(authenticatedUser.getPassword()).isEqualTo("hashed-password");
        assertThat(authenticatedUser.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("ROLE_USER");
        assertThat(authenticatedUser.isAccountNonExpired()).isTrue();
        assertThat(authenticatedUser.isAccountNonLocked()).isTrue();
        assertThat(authenticatedUser.isCredentialsNonExpired()).isTrue();
        assertThat(authenticatedUser.isEnabled()).isTrue();
        assertThat(authenticatedUser.user()).isEqualTo(user);
    }
}
