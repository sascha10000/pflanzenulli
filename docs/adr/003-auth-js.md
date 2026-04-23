# ADR 003: Auth.js (NextAuth v5) for Authentication

## Status
Accepted

## Context
We needed an auth solution. Options: Clerk (managed, best DX, vendor lock-in), Supabase Auth (pairs with Supabase), Auth.js (self-hosted, free, no vendor lock-in). The project prioritizes self-hosting and minimal external dependencies.

## Decision
Use Auth.js (NextAuth v5) with the Drizzle adapter. OAuth providers (Google, Apple) plus email magic links.

## Consequences
- **Positive:** Fully self-hosted. No vendor lock-in. Free. GDPR-compliant by design.
- **Positive:** Native Next.js integration. JWT sessions for stateless auth.
- **Negative:** No built-in MFA -- must implement TOTP separately or rely on OAuth provider MFA.
- **Negative:** More manual work for user management UI compared to Clerk.
