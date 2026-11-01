import { z } from 'zod/v4';

export const ErrorObjectSchema = z.strictObject({
  error: z.strictObject({
    status: z.number(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ErrorObject = z.infer<typeof ErrorObjectSchema>;

export class AppError extends Error {
  constructor(
    public status: 404 | 409 | 422,
    message: string,
    public details?: any,
  ) {
    super(message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: object) {
    super(422, message, details);
  }
}
