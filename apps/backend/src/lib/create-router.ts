import { OpenAPIHono, z } from '@hono/zod-openapi';

export const createRouter = () =>
  new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json({ error: z.treeifyError(result.error) }, 422);
      }
    },
  });
