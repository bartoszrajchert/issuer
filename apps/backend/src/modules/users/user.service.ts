import { db } from '@issuer/database';
import { users } from '@issuer/database/schema';
import { v7 as uuidv7 } from 'uuid';
import type {
  CreateUserInput,
  UserListResponse,
  UserResponse,
} from './user.schema';

export const userService = {
  async getUsers(): Promise<UserListResponse> {
    const usersResult = await db.select().from(users);
    return usersResult.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
    }));
  },
  async createUser(data: CreateUserInput): Promise<UserResponse> {
    const [user] = await db
      .insert(users)
      .values({
        id: uuidv7(),
        name: data.name,
        email: data.email,
      })
      .returning();

    if (!user) {
      throw new Error('User was not returned after the creation');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  },
};
