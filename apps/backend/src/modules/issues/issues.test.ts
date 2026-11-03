import { testClient } from 'hono/testing';
import { describe, expect, it } from 'vitest';
import { app } from '../../app';
import {
  createIssue,
  createStatus,
  createTeam,
  createUser,
} from '../../test/factories';
import { IssueListResponseSchema } from './issues.schema';

const client = testClient(app);

describe('GET /issues', () => {
  it('returns all issues', async () => {
    const team = await createTeam();
    const status = await createStatus({ teamId: team.id });
    const creator = await createUser();

    await createIssue({
      teamId: team.id,
      statusId: status.id,
      creatorId: creator.id,
    });

    const res = await client.issues.$get();

    expect(res.status).toBe(200);
    expect(IssueListResponseSchema.parse(await res.json())).toHaveLength(1);
  });
});
