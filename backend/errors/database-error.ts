import { CustomError } from "./custom-error.js";

export class DatabaseError extends CustomError {
  statusCode = 500;
  errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message || "Database operation failed");
    this.errors = errors;
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}
