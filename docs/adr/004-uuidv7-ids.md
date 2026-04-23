# ADR 004: UUIDv7 for All Primary Keys

## Status
Accepted

## Context
We needed an ID strategy. Options: auto-increment integers (simple, guessable, migration pain), UUIDv4 (random, bad index locality), UUIDv7 (time-ordered, good index performance, globally unique).

## Decision
Use UUIDv7 for all primary keys throughout the application.

## Consequences
- **Positive:** Time-ordered, so B-tree indexes stay efficient (unlike UUIDv4 which fragments indexes).
- **Positive:** Globally unique without coordination. Safe for distributed systems later.
- **Positive:** Not guessable like sequential integers (minor security benefit).
- **Negative:** Larger than integers (16 bytes vs 4-8 bytes). Acceptable tradeoff.
