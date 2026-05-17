import { CustomError } from "./custom-error.js";

export class DocumentCastError extends CustomError {
  statusCode = 400;
  errors: string[];
  invalidMongoId?: string;

  constructor(message: string, errors: string[] = [], invalidMongoId?: string) {
    super(message);
    this.errors = errors;
    this.invalidMongoId = invalidMongoId;
    Object.setPrototypeOf(this, DocumentCastError.prototype);
  }
}
