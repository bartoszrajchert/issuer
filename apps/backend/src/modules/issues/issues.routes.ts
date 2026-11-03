import { createRoute } from '@hono/zod-openapi';
import { jsonContent } from '../../lib/openapi';
import { IssueListResponseSchema } from './issues.schema';

const tags = ['Issues'];

export const list = createRoute({
  method: 'get',
  path: '/',
  tags,
  responses: {
    200: jsonContent(IssueListResponseSchema, 'List issues'),
  },
});
