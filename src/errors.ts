// src/errors.ts
export class NotFoundError extends Error {
  constructor(message: string, public readonly resource?: string) {
    super(message);
    this.name = "NotFoundError";
    // Capture stack trace, excluding this constructor
    Error.captureStackTrace(this, NotFoundError);
    // Ensure correct prototype chain for TypeScript
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
