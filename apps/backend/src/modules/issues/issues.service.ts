import { db } from '@issuer/database';
import type { IssueListResponse } from './issues.schema';

export const issuesService = {
  async getIssues(): Promise<IssueListResponse> {
    const userColumns = {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    } as const;

    const issuesResult = await db.query.issues.findMany({
      with: {
        creator: { columns: userColumns },
        assignee: { columns: userColumns },
      },
    });

    return issuesResult.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      creator: { ...r.creator, createdAt: r.creator.createdAt.toISOString() },
      assignee: r.assignee
        ? { ...r.assignee, createdAt: r.assignee.createdAt.toISOString() }
        : null,
      teamId: r.teamId,
      statusId: r.statusId,
      archivedAt: r.archivedAt?.toISOString() ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  },
};
