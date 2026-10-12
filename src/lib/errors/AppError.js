/**
 * Доменні класи помилок (ERROR-HANDLING-v10 § 1.1 - § 1.2).
 */
export class AppError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {ErrorOptions} [options]
   */
  constructor(code, message, options) {
    super(message, options);
    this.name = "AppError";
    this.code = code;
  }
}

export class ValidationError extends AppError {
  /**
   * @param {Record<string, string>} [fields]
   */
  constructor(fields = {}) {
    super("VALIDATION_ERROR", "Validation failed");
    this.name = "ValidationError";
    this.fields = fields;
  }
}

export class NotFoundError extends AppError {
  /**
   * @param {string} [resource]
   */
  constructor(resource = "Resource") {
    super("NOT_FOUND", `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class NetworkError extends AppError {
  /**
   * @param {string} [message]
   * @param {{ status?: number, retryAfterMs?: number, cause?: unknown }} [options]
   */
  constructor(message = "Network request failed", options = {}) {
    super("NETWORK_ERROR", message, { cause: options.cause });
    this.name = "NetworkError";
    this.status = options.status;
    this.retryAfterMs = options.retryAfterMs;
  }
}

export class AuthError extends AppError {
  /**
   * @param {string} [message]
   */
  constructor(message = "Authentication required") {
    super("AUTH_ERROR", message);
    this.name = "AuthError";
  }
}
