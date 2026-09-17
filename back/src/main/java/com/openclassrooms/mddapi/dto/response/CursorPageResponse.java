package com.openclassrooms.mddapi.dto.response;

import java.util.List;

/**
 * DTO générique enveloppant une page issue d'une pagination keyset (curseur).
 * @param content les éléments de la page courante.
 * @param hasNext indique s'il reste des éléments après cette page.
 * @param nextCursor le curseur opaque à fournir pour récupérer la page suivante, {@code null} si {@code hasNext} est {@code false}.
 */
public record CursorPageResponse<T>(
        List<T> content,
        boolean hasNext,
        Long nextCursor
) {
}
