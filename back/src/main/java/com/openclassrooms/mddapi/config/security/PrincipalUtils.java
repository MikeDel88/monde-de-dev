package com.openclassrooms.mddapi.config.security;

import java.security.Principal;

/**
 * Extrait l'id de l'utilisateur authentifié à partir du {@link Principal}
 * injecté dans les contrôleurs : le subject du JWT est l'id utilisateur (voir
 * {@code JwtServiceImpl}), exposé tel quel comme nom du principal par le
 * résolveur OAuth2 Resource Server.
 */
public final class PrincipalUtils {

    private PrincipalUtils() {
    }

    public static Long userId(Principal principal) {
        return Long.valueOf(principal.getName());
    }
}
