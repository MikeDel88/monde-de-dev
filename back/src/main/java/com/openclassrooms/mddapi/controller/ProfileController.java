package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.documentation.database.ApiDabataseConflictResponse;
import com.openclassrooms.mddapi.documentation.profile.ApiProfileValidResponse;
import com.openclassrooms.mddapi.documentation.profile.ApiProfileUpdateValidResponse;
import com.openclassrooms.mddapi.documentation.profile.ApiProfileUpdateValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.user.ApiUserNotFoundResponse;
import com.openclassrooms.mddapi.dto.request.UpdateProfileRequest;
import com.openclassrooms.mddapi.dto.response.ProfileResponse;
import com.openclassrooms.mddapi.config.security.PrincipalUtils;
import com.openclassrooms.mddapi.service.ProfileService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@Log4j2
@AllArgsConstructor
@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;


    @ApiProfileValidResponse
    @ApiUserNotFoundResponse
    @GetMapping
    public ProfileResponse profile(Principal principal) {
        return profileService.getProfile(PrincipalUtils.userId(principal));
    }

    @ApiProfileUpdateValidResponse
    @ApiProfileUpdateValidationErrorResponse
    @ApiUserNotFoundResponse
    @ApiDabataseConflictResponse
    @PatchMapping
    public ProfileResponse patch(@Valid @RequestBody UpdateProfileRequest request, Principal principal) {
        return profileService.updateProfile(PrincipalUtils.userId(principal), request);
    }
}
