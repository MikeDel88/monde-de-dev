/**
 * Traduction française des codes d'erreur renvoyés par le backend
 * (voir back/.../exception/ErrorCodes.java — source unique des codes).
 * Tenu à jour manuellement : un code backend sans entrée ici retombe sur le
 * message générique de mapHttpErrorToMessage plutôt que d'afficher le code brut.
 */
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  // Auth / register
  NAME_REQUIRED: "Le nom est requis.",
  NAME_TOO_LONG: "Le nom est trop long.",
  NAME_INVALID: "Le nom est invalide.",
  EMAIL_REQUIRED: "L'email est requis.",
  EMAIL_INVALID: "L'email est invalide.",
  EMAIL_TOO_LONG: "L'email est trop long.",
  EMAIL_OR_NAME_REQUIRED: "L'email ou le nom d'utilisateur est requis.",
  PASSWORD_REQUIRED: "Le mot de passe est requis.",
  PASSWORD_TOO_SHORT: "Le mot de passe doit contenir au moins 8 caractères.",
  PASSWORD_MISSING_UPPERCASE: "Le mot de passe doit contenir au moins une lettre majuscule.",
  PASSWORD_MISSING_LOWERCASE: "Le mot de passe doit contenir au moins une lettre minuscule.",
  PASSWORD_MISSING_DIGIT: "Le mot de passe doit contenir au moins un chiffre.",
  PASSWORD_MISSING_SPECIAL_CHAR: "Le mot de passe doit contenir au moins un caractère spécial.",
  PASSWORD_INVALID: "Le mot de passe est invalide.",
  CURRENT_PASSWORD_REQUIRED: "Le mot de passe actuel est requis.",
  CURRENT_PASSWORD_INVALID: "Le mot de passe actuel est incorrect.",
  INVALID_CREDENTIALS: "Identifiants invalides.",

  // Topic / subscription
  TOPIC_REQUIRED: "Le thème est requis.",
  TOPIC_POSITIVE: "Le thème sélectionné est invalide.",
  TOPIC_NOT_FOUND: "Ce thème n'existe pas ou plus.",
  TOPIC_NOT_SUBSCRIBED: "Vous n'êtes pas abonné à ce thème.",

  // Post / comment
  TITLE_REQUIRED: "Le titre est requis.",
  TITLE_TOO_LONG: "Le titre est trop long.",
  CONTENT_REQUIRED: "Le contenu est requis.",
  CONTENT_TOO_LONG: "Le contenu est trop long.",
  DIRECTION_INVALID: "Le sens de tri est invalide.",
  CURSOR_POSITIVE: "Le curseur de pagination est invalide.",
  POST_ID_POSITIVE: "L'identifiant de l'article est invalide.",

  // User
  USER_NOT_FOUND: "Cet utilisateur n'existe pas ou plus.",

  // Génériques / transverses
  ACCESS_DENIED: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
  RATE_LIMIT_EXCEEDED: "Trop de tentatives, réessayez plus tard.",
  DATA_CONFLICT: "Un conflit est survenu.",
  PARAMETER_INVALID: "Un paramètre de la requête est invalide.",
  MALFORMED_JSON: "La requête envoyée est invalide.",
  INTERNAL_SERVER_ERROR: "Une erreur est survenue, veuillez réessayer plus tard.",
};

/**
 * Traduit un code d'erreur backend en message français via {@link ERROR_CODE_MESSAGES}.
 * @param code Code d'erreur métier, ou `undefined` si le backend n'en a pas fourni.
 * @returns Le message traduit, ou `undefined` si `code` est absent ou inconnu (à charge
 * de l'appelant de retomber sur un message générique).
 */
export function translateErrorCode(code: string | undefined): string | undefined {
  return code ? ERROR_CODE_MESSAGES[code] : undefined;
}
