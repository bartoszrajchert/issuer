import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { envSchema } from './src/env';

config({ path: '../../.env' });

const env = envSchema.parse(process.env);

export default defineConfig({
  out: './drizzle',
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
