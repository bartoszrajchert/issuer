import { OpenAPIHono, z } from '@hono/zod-openapi';
import { ValidationError } from './errors';

export const createRouter = () =>
  new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        throw new ValidationError(
          'Validation Error',
          z.treeifyError(result.error),
        );
      }
    },
  });
