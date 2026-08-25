package com.openclassrooms.mddapi.exception;

import io.swagger.v3.oas.annotations.media.Schema;

public record FieldError(
        @Schema(description = "Nom du champ en erreur") String field,
        @Schema(description = "Code d'erreur identifiant la règle de validation violée") String code
) {
}
