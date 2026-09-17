package com.openclassrooms.mddapi.config.security;

import com.openclassrooms.mddapi.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adapte l'entité {@link User} au contrat {@link UserDetails} de Spring
 * Security, utilisé par le {@code UserDetailsService} lors de l'authentification.
 */
public record AuthenticatedUser(User user) implements UserDetails {

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }
}
