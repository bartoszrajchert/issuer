import { z } from '@hono/zod-openapi';
import { prioritySchema } from '@issuer/shared';
import { UserResponseSchema } from '../users/user.schema';

export type IssueResponse = z.infer<typeof IssueResponseSchema>;
export const IssueResponseSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  description: z.string().nullable(),
  priority: prioritySchema,
  teamId: z.uuidv7(),
  creator: UserResponseSchema,
  assignee: UserResponseSchema.nullable(),
  statusId: z.uuidv7(),
  archivedAt: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type IssueListResponse = z.infer<typeof IssueListResponseSchema>;
export const IssueListResponseSchema = z.array(IssueResponseSchema);
