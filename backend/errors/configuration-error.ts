import { CustomError } from "./custom-error.js";

export class ConfigurationError extends CustomError {
  statusCode = 500;
  errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message ? message : "Error in configurations");
    this.errors = errors;
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
