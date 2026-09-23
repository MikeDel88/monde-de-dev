/** Page de résultats paginée par curseur (et non par numéro de page). */
export interface CursorPage<T> {
  /** Éléments de la page courante. */
  content: T[];
  /** `true` s'il existe une page suivante à charger via `nextCursor`. */
  hasNext: boolean;
  /** Curseur à renvoyer pour obtenir la page suivante ; `null` s'il n'y en a pas (voir `hasNext`). */
  nextCursor: number | null;
}
