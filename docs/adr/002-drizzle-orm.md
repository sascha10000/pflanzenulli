# ADR 002: Drizzle ORM for Database Access

## Status
Accepted

## Context
We needed a TypeScript ORM for PostgreSQL. Options considered: Prisma (most popular, own query engine, schema DSL), Drizzle (SQL-like, lightweight, TypeScript-native), Kysely (query builder, no ORM).

## Decision
Use Drizzle ORM with the `postgres` driver.

## Consequences
- **Positive:** Type-safe queries that look like SQL. No separate schema language. Lightweight runtime.
- **Positive:** Migration system (`drizzle-kit`) generates SQL migrations from schema diffs.
- **Positive:** Schema files are regular TypeScript, co-located with module code.
- **Negative:** Smaller ecosystem than Prisma. Fewer guides and examples. Acceptable given the team's SQL familiarity.
