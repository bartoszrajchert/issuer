import { serve } from '@hono/node-server';
import { app, SWAGGER_SLUG } from './app';
import { envSchema } from './lib/env';

const env = envSchema.parse(process.env);

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT ?? 3001,
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
