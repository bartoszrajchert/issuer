import type { ZodType } from 'zod';
import { ErrorObjectSchema } from './errors';

export const jsonContent = <T extends ZodType>(
  schema: T,
  description: string,
) => ({
  content: { 'application/json': { schema } },
  description,
});

export const jsonBody = <T extends ZodType>(schema: T) => ({
  content: { 'application/json': { schema } },
  required: true,
});

export const validationErrorResponse = {
  422: jsonContent(ErrorObjectSchema, 'Validation error'),
};
