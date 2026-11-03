import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

const TEMPLATE = 'issuer_test_template';
const workerDbName = (id: number | string) => `issuer_test_${id}`;
const withDb = (url: string, name: string) => {
  const u = new URL(url);
  u.pathname = `/${name}`;
  return u.toString();
};

export const workerDatabaseUrl = (adminUrl: string, poolId: string) =>
  withDb(adminUrl, workerDbName(poolId));

export async function prepareTestDatabases(adminUrl: string, workers: number) {
  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS ${TEMPLATE} WITH (FORCE)`);
    await admin.query(`CREATE DATABASE ${TEMPLATE}`);

    const template = drizzle(withDb(adminUrl, TEMPLATE));
    await migrate(template, {
      migrationsFolder: new URL('../drizzle', import.meta.url).pathname,
    });
    await template.$client.end(); // Postgres refuses to clone a template that has open connections

    for (let i = 1; i <= workers; i++) {
      await admin.query(
        `DROP DATABASE IF EXISTS ${workerDbName(i)} WITH (FORCE)`,
      );
      await admin.query(
        `CREATE DATABASE ${workerDbName(i)} TEMPLATE ${TEMPLATE}`,
      );
    }
  } finally {
    await admin.end();
  }
}
