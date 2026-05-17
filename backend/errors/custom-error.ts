export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
