package com.openclassrooms.mddapi.documentation.profil;

import io.swagger.v3.oas.annotations.responses.ApiResponse;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@ApiResponse(
        responseCode = "200",
        description = "le profil (nom/email) a bien été mis à jour"
)
public @interface ApiProfilUpdateValidResponse {
}
