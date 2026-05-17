import { CustomError } from "./custom-error.js";

export class UnsupportedMediaTypeError extends CustomError {
  statusCode = 415;
  errors: string[];

  constructor(message: string, errors: string[] = []) {
    super("Unsupported Media Type. Expected application/json.");
    this.errors = errors;
    Object.setPrototypeOf(this, UnsupportedMediaTypeError.prototype);
  }
}
