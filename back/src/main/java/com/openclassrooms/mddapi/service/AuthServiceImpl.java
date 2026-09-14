package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.config.security.AuthenticatedUser;
import com.openclassrooms.mddapi.dto.request.LoginRequest;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.dto.response.AuthResponse;
import com.openclassrooms.mddapi.mapper.UserMapper;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

/**
 * Implémentation de {@link AuthService} : inscription (hachage du mot de
 * passe via le mapper) et connexion (délégation à l'{@link AuthenticationManager}
 * puis génération d'un JWT via {@link JwtService}).
 */
@Log4j2
@AllArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        log.info("service : register");
        User user = userMapper.toUser(request, passwordEncoder);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        log.info("service : login");
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.emailOrName(), request.password())
        );

        User user = ((AuthenticatedUser) Objects.requireNonNull(authentication.getPrincipal())).user();

        return new AuthResponse(jwtService.generateAccessToken(user));
    }
}
