import {
  AuthError,
  NetworkError,
  NotFoundError,
  ValidationError,
} from "./AppError.js";

/**
 * Помилка → ключ словника. Людина бачить t(ключ); err.message в інтерфейс не йде.
 */
export function errorToMessageKey(err) {
  if (err instanceof ValidationError) return "errors.validation";
  if (err instanceof NotFoundError) return "errors.notFound";
  if (err instanceof NetworkError) return "errors.network";
  if (err instanceof AuthError) return "errors.auth";
  return "errors.unexpected";
}
