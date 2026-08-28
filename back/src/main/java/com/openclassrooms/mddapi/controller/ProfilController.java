package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.documentation.database.ApiDabataseConflictResponse;
import com.openclassrooms.mddapi.documentation.profil.ApiProfileValidResponse;
import com.openclassrooms.mddapi.documentation.profil.ApiProfilUpdatePasswordValidResponse;
import com.openclassrooms.mddapi.documentation.profil.ApiProfilUpdatePasswordValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.profil.ApiProfilUpdateValidResponse;
import com.openclassrooms.mddapi.documentation.profil.ApiProfilUpdateValidationErrorResponse;
import com.openclassrooms.mddapi.documentation.user.ApiUserNotFoundResponse;
import com.openclassrooms.mddapi.dto.request.UpdateProfilPasswordRequest;
import com.openclassrooms.mddapi.dto.request.UpdateProfilRequest;
import com.openclassrooms.mddapi.dto.response.ProfileResponse;
import com.openclassrooms.mddapi.service.ProfilService;
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
public class ProfilController {

    private final ProfilService profilService;


    @ApiProfileValidResponse
    @ApiUserNotFoundResponse
    @GetMapping
    public ProfileResponse profile(Principal principal) {
        return profilService.getProfil(Long.parseLong(principal.getName()));
    }

    @ApiProfilUpdateValidResponse
    @ApiProfilUpdateValidationErrorResponse
    @ApiUserNotFoundResponse
    @ApiDabataseConflictResponse
    @PatchMapping
    public ProfileResponse patch(@Valid @RequestBody UpdateProfilRequest request, Principal principal) {
        return profilService.updateProfil(Long.parseLong(principal.getName()), request);
    }

    @ApiProfilUpdatePasswordValidResponse
    @ApiProfilUpdatePasswordValidationErrorResponse
    @ApiUserNotFoundResponse
    @PatchMapping("/password")
    public void patchPassword(@Valid @RequestBody UpdateProfilPasswordRequest request, Principal principal) {
        profilService.updatePassword(Long.parseLong(principal.getName()), request);
    }
}
