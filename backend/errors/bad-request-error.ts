import { CustomError } from "./custom-error.js";

export class BadRequestError extends CustomError {
  statusCode = 400;
  errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.errors = errors;
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
