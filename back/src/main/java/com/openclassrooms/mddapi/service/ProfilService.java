package com.openclassrooms.mddapi.service;

import com.openclassrooms.mddapi.dto.response.ProfilResponse;

public interface ProfilService {
    ProfilResponse getProfil(Long userId);
}
