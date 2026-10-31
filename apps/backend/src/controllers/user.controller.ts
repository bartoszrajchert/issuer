import { createRoute } from '@hono/zod-openapi';
import {
  CreateUserSchema,
  UserListResponseSchema,
  UserResponseSchema,
} from '../schemas/user.schema.js';

export const getUserRoute = createRoute({
  method: 'get',
  path: '/users',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserListResponseSchema,
        },
      },
      description: 'List all users',
    },
  },
});

export const createUserRoute = createRoute({
  method: 'post',
  path: '/users',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateUserSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: UserResponseSchema,
        },
      },
      description: 'Create the user',
    },
  },
});
