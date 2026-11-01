import { z } from 'zod';

export const envSchema = z.object({
  PORT: z
    .string()
    .nonempty()
    .optional()
    .transform((str) => (str || str === '' ? Number(str) : undefined)),
});
