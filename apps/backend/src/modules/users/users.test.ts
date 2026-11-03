import { testClient } from 'hono/testing';
import { describe, expect, it } from 'vitest';
import { app } from '../../app';
import { ErrorObjectSchema } from '../../lib/errors';
import { createUser } from '../../test/factories';
import { UserListResponseSchema, UserResponseSchema } from './user.schema';

const client = testClient(app);

describe('GET /users', () => {
  it('returns all users', async () => {
    await createUser({ email: 'a@example.com' });
    await createUser({ email: 'b@example.com' });

    const res = await client.users.$get();

    expect(res.status).toBe(200);
    expect(UserListResponseSchema.parse(await res.json())).toHaveLength(2);
  });
});

describe('POST /posts', async () => {
  it('creates a user', async () => {
    const res = await client.users.$post({
      json: { name: 'John Doe', email: 'john@example.com' },
    });

    expect(res.status).toBe(201);
    expect(UserResponseSchema.parse(await res.json())).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('returns 409 when the email differs only by letter case', async () => {
    await createUser({ email: 'John@Example.com' });

    const res = await client.users.$post({
      json: { name: 'John Doe', email: 'john@example.com' },
    });

    expect(res.status).toBe(409);
    expect(ErrorObjectSchema.parse(await res.json()).error.message).toBe(
      'Email already taken',
    );
  });

  it('returns 422 for invalid values', async () => {
    const res = await client.users.$post({
      json: { name: 'J', email: 'not-an-email' },
    });

    expect(res.status).toBe(422);
    ErrorObjectSchema.parse(await res.json());
  });

  it('returns 422 when a field is missing', async () => {
    // @ts-expect-error -- deliberately sending an invalid body
    const res = await client.users.$post({ json: { name: 'John Doe' } });

    expect(res.status).toBe(422);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await app.request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not json',
    });

    expect(res.status).toBe(400);
  });
});
