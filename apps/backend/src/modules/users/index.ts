import { createRouter } from '../../lib/create-router';
import { create, list } from './user.routes';
import { userService } from './user.service';

export const usersRouter = createRouter()
  .openapi(list, async (c) => c.json(await userService.getUsers(), 200))
  .openapi(create, async (c) =>
    c.json(await userService.createUser(c.req.valid('json')), 201),
  );
