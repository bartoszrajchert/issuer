import { createRoute } from '@hono/zod-openapi';
import { jsonBody, jsonContent } from '../../lib/openapi';
import {
  CreateUserSchema,
  UserListResponseSchema,
  UserResponseSchema,
} from './user.schema';

const tags = ['Users'];

export const list = createRoute({
  method: 'get',
  path: '/',
  tags,
  responses: { 200: jsonContent(UserListResponseSchema, 'List users') },
});

export const create = createRoute({
  method: 'post',
  path: '/',
  tags,
  request: { body: jsonBody(CreateUserSchema) },
  responses: {
    201: jsonContent(UserResponseSchema, 'Created user'),
    // 422: jsonContent(ValidationErrorSchema, 'Validation error'),
  },
});
