import { z } from '@hono/zod-openapi';

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(255).openapi({ example: 'John Doe' }),
  email: z.email().openapi({ example: 'user@example.com' }),
});

export const UserResponseSchema = z.object({
  id: z.uuidv7().openapi({ example: '00000000-0000-0000-0000-000000000000' }),
  name: z.string().min(2).max(255).openapi({ example: 'John Doe' }),
  email: z.email().openapi({ example: 'user@example.com' }),
  createdAt: z.iso.datetime().openapi({ example: '2026-10-20T00:00:00.000Z' }),
});

export const UserListResponseSchema = z.array(UserResponseSchema);

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
