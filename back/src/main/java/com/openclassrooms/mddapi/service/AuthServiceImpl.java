package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.LoginRequest;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.dto.response.AuthResponse;
import com.openclassrooms.mddapi.exception.UserNotFoundException;
import com.openclassrooms.mddapi.mapper.UserMapper;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implémentation de {@link AuthService} : inscription (hachage du mot de
 * passe via le mapper) et connexion (vérification des identifiants puis
 * génération d'un JWT via {@link JwtService}).
 */
@Log4j2
@AllArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

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
        User user = userRepository
                .findUsersByEmailOrName(request.emailOrName(), request.emailOrName())
                .orElseThrow(UserNotFoundException::new);

        if(!passwordEncoder.matches(request.password(), user.getPassword())) {
            log.error("service : password not matches");
            throw new UserNotFoundException();
        }

        return new AuthResponse(jwtService.generateAccessToken(user));
    }
}
