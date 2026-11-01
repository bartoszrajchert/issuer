import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';

export const isUniqueViolation = (err: unknown, constraint?: string) =>
  err instanceof DrizzleQueryError &&
  err.cause instanceof DatabaseError &&
  err.cause.code === '23505' &&
  (!constraint || err.cause.constraint === constraint);
