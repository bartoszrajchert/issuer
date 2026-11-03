import { workerDatabaseUrl } from '@issuer/database/testing';
import { afterAll, beforeEach, inject } from 'vitest';

process.env.DATABASE_URL = workerDatabaseUrl(
  inject('adminDatabaseUrl'),
  process.env.VITEST_POOL_ID!,
);

// Dynamic import: @issuer/database creates `db` as soon as it's imported, so DATABASE_URL must be set first.
// A static import would be hoisted above the line before.
const { db, sql } = await import('@issuer/database');

const { rows } = await db.execute<{ tables: string }>(sql`
  SELECT string_agg(format('%I.%I', schemaname, tablename), ', ') AS tables
  FROM pg_tables WHERE schemaname = 'public'
`);
const truncate = sql.raw(
  `TRUNCATE ${rows[0]!.tables} RESTART IDENTITY CASCADE`,
);

beforeEach(async () => {
  await db.execute(truncate);
});

afterAll(async () => {
  await db.$client.end(); // close this file's connection pool
});
