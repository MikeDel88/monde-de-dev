/**
 * Erreur applicative produite par `error-interceptor` à partir d'une réponse HTTP en échec.
 * Le `message` est déjà traduit en français et prêt à être affiché à l'utilisateur.
 */
export class AppError extends Error {
  /**
   * @param message Message déjà traduit, affichable tel quel.
   * @param status Code de statut HTTP d'origine.
   */
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}
