import type { ZodType } from 'zod';

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
