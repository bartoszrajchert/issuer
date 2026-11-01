import { drizzle } from 'drizzle-orm/node-postgres';
import { envSchema } from './env';
import { relations } from './schema';

const env = envSchema.parse(process.env);

export const db = drizzle(env.DATABASE_URL, {
  relations: { ...relations },
});

export * from './errors';
export * from './schema';
