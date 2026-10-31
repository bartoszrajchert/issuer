import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import {
  createUserRoute,
  getUserRoute,
} from './controllers/user.controller.js';
import { userService } from './services/user.service.js';

// const app = new Hono();
const app = new OpenAPIHono();

app.openapi(getUserRoute, async (c) => {
  const users = await userService.getUsers();
  return c.json(users, 200);
});

app.openapi(createUserRoute, async (c) => {
  const data = c.req.valid('json');
  const user = await userService.createUser(data);
  return c.json(user, 201);
});

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'My API',
  },
});
app.get('/ui', swaggerUI({ url: '/doc' }));
app.get('/health', (c) => c.text('OK'));

const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
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
