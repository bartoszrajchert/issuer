import { prepareTestDatabases } from '@issuer/database/testing';
import type { TestProject } from 'vitest/node';

export default async function setup(project: TestProject) {
  process.loadEnvFile(new URL('../../../../.env.test', import.meta.url));
  const adminUrl = process.env.DATABASE_URL!; // e.g. postgres://…/postgres
  await prepareTestDatabases(adminUrl, project.config.maxWorkers);
  project.provide('adminDatabaseUrl', adminUrl);
}

declare module 'vitest' {
  export interface ProvidedContext {
    adminDatabaseUrl: string;
  }
}
