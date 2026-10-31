import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { createRouter } from './lib/create-router';
import { usersRouter } from './modules/users';

const SWAGGER_SLUG = '/ui';

const app = createRouter()
  .route('/users', usersRouter)
  .doc31('/doc', {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'Issuer API',
    },
  })
  .get(SWAGGER_SLUG, swaggerUI({ url: '/doc' }))
  .get('/health', (c) => c.text('OK'));

// app.onError(errorHandler); // one place to map errors (e.g. a duplicate email) to 409/404/500
export type AppType = typeof app; // keeps the hc RPC client typed

const server = serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
    console.log(
      `Swagger is running on http://localhost:${info.port}${SWAGGER_SLUG}`,
    );
  },
);

process.on('SIGINT', () => {
  server.close();
  process.exit(0);
});
process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
