import { swaggerUI } from '@hono/swagger-ui';
import { HTTPException } from 'hono/http-exception';
import { createRouter } from './lib/create-router';
import { AppError, type ErrorObject } from './lib/errors';
import { usersRouter } from './modules/users';

export const SWAGGER_SLUG = '/ui';

export const app = createRouter()
  .route('/users', usersRouter)
  .doc31('/doc', {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'Issuer API',
    },
  })
  .get(SWAGGER_SLUG, swaggerUI({ url: '/doc' }))
  .get('/health', (c) => c.text('OK'))
  .onError((err, c) => {
    if (err instanceof AppError) {
      return c.json(
        {
          error: {
            status: err.status,
            message: err.message,
            details: err.details,
          },
        } satisfies ErrorObject,
        err.status,
      );
    }
    if (err instanceof HTTPException) {
      return c.json(
        {
          error: {
            status: err.status,
            message: err.message,
          },
        } satisfies ErrorObject,
        err.status,
      );
    }
    console.error(err);
    return c.json(
      {
        error: {
          status: 500,
          message: 'Internal Server Error',
        },
      } satisfies ErrorObject,
      500,
    );
  });

export type AppType = typeof app; // keeps the hc RPC client typed
