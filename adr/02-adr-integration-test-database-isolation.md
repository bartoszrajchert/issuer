---
status: Complete
---

# ADR: Integration Test Database Isolation

## Context and Problem Statement

Backend integration tests call the Hono app (`app.request()`) and hit a real PostgreSQL database through the global `db` client from `@issuer/database`. Data written by one test persisted into the next run, so POST tests failed with `409` on unique constraints (e.g. `users_email_lower_unique_index`). Vitest also runs test files in parallel workers, so a shared database lets one file's cleanup or inserts leak into another file's assertions.

How do we give every test a known, empty database state while keeping test files running in parallel (no `fileParallelism: false`), with a setup that scales as the project and the number of tables grow?

The scope is the backend test setup (`apps/backend/vitest.config.js`, `apps/backend/test/*`) and the test helpers exported from `@issuer/database/testing`. It follows how other projects solve the same problem: Rails (`parallelize` with a database per worker + transactional tests), Django (`test --parallel` clones the test database per process), [Epic Stack](https://github.com/epicweb-dev/epic-stack/blob/main/tests/setup/db-setup.ts) (a database per `VITEST_POOL_ID`, reset from a template) and [IntegreSQL](https://github.com/allaboutapps/integresql) (a pool of template database clones).

## Considered Options

- Shared test database with `fileParallelism: false` - run test files one by one against a single database.
- Unique data per test - generate random values (e.g. `user-${uuid}@example.com`) and never clean up.
- Transaction rollback per test - wrap every test in a transaction and roll it back.
- Fresh database per test - clone a template database (or start a Testcontainers instance) for every test.
- Database per worker cloned from a template + `TRUNCATE` before each test.

## Decision Outcome

Chosen option: **Database per worker cloned from a template + `TRUNCATE` before each test**, because it is the only option that keeps test files parallel, gives every test an empty database, and works with the current code where services import a global `db` instead of receiving it.

How it works:

1. `globalSetup` (`apps/backend/test/global-setup.ts`) runs once: it recreates `issuer_test_template`, runs the Drizzle migrations on it, and clones it into `issuer_test_1` … `issuer_test_<maxWorkers>` with `CREATE DATABASE … TEMPLATE`. Migrations run once per test run, and every clone matches the current schema.
2. The setup file (`apps/backend/test/setup.ts`) runs in each worker: it points `DATABASE_URL` at `issuer_test_<VITEST_POOL_ID>` before `@issuer/database` is imported (dynamic import), and runs `TRUNCATE … RESTART IDENTITY CASCADE` on all `public` tables before each test.
3. Within one worker, files and tests run one after another, so the truncate never overlaps with another test. Workers never share a database.

Why the other options were rejected:

- `fileParallelism: false` - simplest, but test time grows linearly with the number of test files.
- Unique data per test - parallel-safe, but the database keeps growing and assertions like "the list has exactly one user" become impossible. It is still fine to use together with the chosen option.
- Transaction rollback - the fastest reset and the Rails/Django default, but the app must run its queries on the test's connection. Our services import a global `db` pool, so this would need `db` to be injected per request (Hono context or `AsyncLocalStorage`) first. Transactions inside the tested code also become savepoints, which behave slightly differently.
- Fresh database per test - the strongest isolation, but cloning or starting a database for every test costs tens of milliseconds or more per test, and needs extra tooling (IntegreSQL, Testcontainers).

### Consequences

- Good, because test files run in parallel and each worker has its own database, so tests cannot affect each other.
- Good, because every test starts with empty tables, so conflict cases (e.g. `409` on a duplicate email) are created on purpose inside the test.
- Good, because the schema always comes from the real migrations, so tests also catch broken migrations.
- Good, because it works with any connection usage in the app: the global pool, multiple connections and real transactions.
- Bad, because `TRUNCATE` has a fixed cost per table, so the reset gets slower as the schema grows. If it becomes the bottleneck, move to transaction rollback, which requires injecting `db` instead of importing it.
- Bad, because data inserted by migrations (reference data) is wiped too, so such tables must be excluded from the truncate or re-seeded.
- Bad, because every worker opens its own connection pool (`pg` default: 10 connections), so many workers can exceed Postgres `max_connections` (default: 100). The pool size or `maxWorkers` must be limited in tests.
- Bad, because `test.concurrent` must not be used in database tests, since the truncate assumes tests in a file run one at a time.
- Bad, because the setup must import `@issuer/database` dynamically after `DATABASE_URL` is set, and `@issuer/database/testing` must never import the `db` client.
