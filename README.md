# issuer

🐞 Issue tracker like Linear.

## Why / what it demonstrates

The motivation behind this project is to prepare a well structured project with lots of concepts ranging from product design, development (front-end, back-end) to system design, and AI implementation. It a project which demonstrates fields in building a proper product from start to end.

## Stack

- **Core:** TypeScript end-to-end, React (or Next.js), Node (Fastify or Hono), PostgreSQL, Drizzle.
- **Client:** IndexedDB (idb or Dexie), optional Yjs for descriptions.
- **Real-time:** WebSocket.
- **AI:** Vercel AI SDK or SDK from provider, structured outputs, pgvector.
- **Infra:** Azure Container Apps and Azure Database for PostgreSQL using Bicep, GitHub Actions with OIDC.

## Milestones

| #   | Zakres                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------- |
| M1  | CRUD, auth, Postgres, UI with Cmd+K, deploy Bicep + GH Actions                                       |
| M2  | Local-first: IndexedDB as a source of read, outbox, optimistic updates with rollback, offline        |
| M3  | Sync: server `syncId`, delta through WebSocket, reconnect from `lastSyncId`, LWW per field, Yjs      |
| M4  | AI: auto-triage, embedding deduplication, RAG, agent through MCP, evals (server MCP and auto-triage) |
| M5  | E2E tests (offline, 2 clients), metrics, README with ADR, blog post                                  |
