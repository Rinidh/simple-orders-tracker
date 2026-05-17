import { CustomError } from "./custom-error.js";

export class NotFoundError extends CustomError {
  statusCode = 404;
  errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.errors = errors;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
