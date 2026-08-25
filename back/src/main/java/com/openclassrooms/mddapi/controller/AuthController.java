package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.documentation.database.ApiDabataseConflictResponse;
import com.openclassrooms.mddapi.documentation.register.ApiRegisterValidResponse;
import com.openclassrooms.mddapi.dto.request.RegisterRequest;
import com.openclassrooms.mddapi.documentation.register.ApiRegisterValidationErrorResponse;
import com.openclassrooms.mddapi.service.AuthService;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Log4j2
@AllArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private AuthService authService;

    @SecurityRequirements()
    @ApiRegisterValidResponse
    @ApiDabataseConflictResponse
    @ApiRegisterValidationErrorResponse
    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @Valid @RequestBody RegisterRequest registerRequest
    ) {
        log.info("call /register");
        authService.register(registerRequest);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .build();
    }
}
