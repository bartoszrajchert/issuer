import { db, issues, statuses, teams, users } from '@issuer/database';
import { PRIORITY } from '@issuer/shared';
import { v7 as uuidv7 } from 'uuid';

export async function createUser(
  overrides: Partial<typeof users.$inferInsert> = {},
) {
  const [user] = await db
    .insert(users)
    .values({
      id: uuidv7(),
      name: 'John Doe',
      email: `user-${uuidv7()}@example.com`,
      ...overrides,
    })
    .returning();
  return user!;
}

type IssueInsert = typeof issues.$inferInsert;
export async function createIssue(
  data: Pick<IssueInsert, 'teamId' | 'statusId' | 'creatorId'> &
    Partial<IssueInsert>,
) {
  const [issue] = await db
    .insert(issues)
    .values({
      id: uuidv7(),
      title: 'Test issue',
      priority: PRIORITY.HIGH,
      ...data,
    })
    .returning();
  return issue!;
}

export async function createTeam(
  overrides: Partial<typeof teams.$inferInsert> = {},
) {
  const [team] = await db
    .insert(teams)
    .values({ id: uuidv7(), name: `Team ${uuidv7()}`, ...overrides }) // teams.name is unique
    .returning();
  return team!;
}

export async function createStatus(
  data: Pick<typeof statuses.$inferInsert, 'teamId'> &
    Partial<typeof statuses.$inferInsert>,
) {
  const [status] = await db
    .insert(statuses)
    .values({ id: uuidv7(), name: 'Todo', ...data }) // (teamId, name) is unique
    .returning();
  return status!;
}
