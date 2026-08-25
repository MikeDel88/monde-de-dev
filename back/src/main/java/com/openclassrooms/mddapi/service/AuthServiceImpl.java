package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.mapper.UserMapper;
import com.openclassrooms.mddapi.model.User;
import com.openclassrooms.mddapi.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Log4j2
@AllArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {

    private UserRepository userRepository;
    private UserMapper userMapper;
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        log.info("service : register");
        User user = userMapper.toUser(request, passwordEncoder);
        userRepository.save(user);
    }
}
