package com.openclassrooms.mddapi.controller;

import com.openclassrooms.mddapi.documentation.profil.ApiProfileValidResponse;
import com.openclassrooms.mddapi.documentation.user.ApiUserNotFoundResponse;
import com.openclassrooms.mddapi.dto.response.ProfilResponse;
import com.openclassrooms.mddapi.service.ProfilService;
import lombok.AllArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@Log4j2
@AllArgsConstructor
@RestController
@RequestMapping("/profile")
public class ProfilController {

    private ProfilService profilService;


    @ApiProfileValidResponse
    @ApiUserNotFoundResponse
    @GetMapping
    public ProfilResponse profile(Principal principal) {
        return profilService.getProfil(Long.parseLong(principal.getName()));
    }
}
