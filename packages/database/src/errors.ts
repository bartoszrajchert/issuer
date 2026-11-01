import { DrizzleQueryError } from 'drizzle-orm';

export const isUniqueViolation = (err: unknown, constraint?: string) =>
  err instanceof DrizzleQueryError &&
  (err.cause as any)?.code === '23505' &&
  (!constraint || (err.cause as any)?.constraint === constraint);
