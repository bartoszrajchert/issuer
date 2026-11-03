import { createRouter } from '../../lib/create-router';
import { list } from './issues.routes';
import { issuesService } from './issues.service';

export const issuesRouter = createRouter().openapi(list, async (c) =>
  c.json(await issuesService.getIssues(), 200),
);
