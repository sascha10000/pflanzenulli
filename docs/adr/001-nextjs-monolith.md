# ADR 001: Next.js App Router Monolith

## Status
Accepted

## Context
We needed to choose between a monolith (Next.js API routes) and a split architecture (Next.js frontend + NestJS/FastAPI backend). The team is small, velocity matters most in Phase 1, and we want shared types between frontend and backend.

## Decision
Use Next.js App Router as a monolith with API routes for the backend. No separate backend service.

## Consequences
- **Positive:** Shared TypeScript types end-to-end. Single deployment. Fastest development velocity. SSR for SEO built-in.
- **Positive:** Auth.js integrates natively with Next.js.
- **Negative:** API routes are less structured than a dedicated framework like NestJS. Mitigated by our modular `/modules/` organization.
- **Negative:** If we need to scale API and frontend independently, we'd need to extract. Acceptable for Phase 1-2.
