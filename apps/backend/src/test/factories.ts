import { db, users } from '@issuer/database';
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
