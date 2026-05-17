import { CustomError } from "./custom-error.js";

export class ValidationError extends CustomError {
  statusCode = 422;
  errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
