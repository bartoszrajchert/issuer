import { z } from 'zod/v4';

export const envSchema = z.object({
  DATABASE_URL: z.string().nonempty(),
  PORT: z
    .string()
    .optional()
    .transform((str) => (str || str === '' ? Number(str) : undefined)),
});
