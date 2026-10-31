---
status: Complete
---

# ADR: Application Core Technology

## Context and Problem Statement

This problem is about choosing the right application core technology which will be used during the development to build a robust and scalable backend with frontend written in React. The solution should enable to build local-first application (which might be a desktop app someday) with WebSocket and to be easly deployable.

## Considered Options

- React (Vite) + Hono
- Next.js

## Decision Outcome

Chosen option: **React (Vite) + Hono**, because there is no need for Next.js application which is mainly used to enable SSR/RSC/SSG, and WebSocket isn't fully supported yet and requires to build custom `sever.js` with RFC API or `next-ws` dependency. If there will be need to build a website which is focused on SEO, e.g. landing page, than the Next.js will be reconsidered or used as a separate application just for marketing purpose.

### Consequences

- Good, because we have build-in support for WebSocket, better fit for local-first application, clear separation between backend, frontend and shared packages.
- Bad, because the React (Vite) + Hono requires more configuration, and the structure of the project will be bigger than just using Next.js, and no SEO/SSR for public site.
