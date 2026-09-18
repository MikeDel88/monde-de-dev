package com.openclassrooms.mddapi.controller.support;

import com.openclassrooms.mddapi.exception.ErrorCodes;
import org.junit.jupiter.params.provider.Arguments;

import java.util.stream.Stream;

/**
 * Jeu de mots de passe invalides partagé entre les tests de contrôleur
 * exerçant {@code @ValidPassword} (register et mise à jour de profil).
 * Chaque cas isole une seule règle en échec.
 */
public final class PasswordCases {

    private PasswordCases() {
    }

    public static Stream<Arguments> invalidPasswords() {
        return Stream.of(
                Arguments.of("Aa1!aaa", ErrorCodes.PASSWORD_TOO_SHORT),
                Arguments.of("aaaaaaa1!", ErrorCodes.PASSWORD_MISSING_UPPERCASE),
                Arguments.of("AAAAAAA1!", ErrorCodes.PASSWORD_MISSING_LOWERCASE),
                Arguments.of("Aaaaaaaa!", ErrorCodes.PASSWORD_MISSING_DIGIT),
                Arguments.of("Aaaaaaaa1", ErrorCodes.PASSWORD_MISSING_SPECIAL_CHAR)
        );
    }
}
