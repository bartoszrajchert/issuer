export class AppError extends Error {
  constructor(
    public status: 404 | 409,
    message: string,
  ) {
    super(message);
  }
}

export class Conflict409Error extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}
