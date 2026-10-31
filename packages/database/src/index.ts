import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { issues, relations } from "./schema";

const db = drizzle(process.env.DATABASE_URL!, { relations: { ...relations } });

async function main() {
  const dbIssues = await db.select().from(issues).execute();
  console.log(dbIssues);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$client.end());
