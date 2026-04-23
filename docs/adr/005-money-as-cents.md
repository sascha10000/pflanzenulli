# ADR 005: Money Stored as Integer Cents

## Status
Accepted

## Context
Floating point arithmetic causes rounding errors with monetary values (e.g., `0.1 + 0.2 !== 0.3`). This is a known source of bugs in financial systems.

## Decision
All monetary values are stored as integer cents with an ISO 4217 currency code. Conversion to display format happens only in the presentation layer.

## Consequences
- **Positive:** No floating point rounding errors. Exact arithmetic always.
- **Positive:** Database storage is a simple integer column. Efficient comparisons and aggregations.
- **Positive:** Currency code travels with the amount, preventing unit confusion.
- **Negative:** Must remember to convert for display. Mitigated by the `formatMoney()` utility.
