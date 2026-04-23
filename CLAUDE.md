# Project Specification v2 – Plant Swap Platform (EU)

> **Working title:** "Pflanzenulli" (placeholder – final name TBD)
> **Status:** Pre-development specification
> **Last updated:** April 2026
> **Intended use:** Load this as `CLAUDE.md` or equivalent context document for Claude Code sessions.

---

## 0. How To Use This Document

This spec is written as a **decision record and architecture guide**, not as a feature checklist. When working with Claude Code on this project:

- Treat Section 2 (Hard Constraints) as **non-negotiable** – Claude must not propose implementations that violate these.
- Section 3 (Architectural Decisions) records **why** we chose things – reference it when Claude suggests alternatives.
- Section 5 (Phases) is the build order. Do not build ahead.
- Open TODOs at the end of this doc are explicitly unresolved. Ask the user before assuming.

---

## 1. Product Vision

### One-liner
A plant-focused, community-first C2C swap and marketplace for Europe, where hobbyists and small growers trade cuttings, seeds (via verified merchants only), and plant accessories, rewarded with a non-monetary reputation system.

### Core principles
1. **Community over transaction volume.** We are not eBay. We are a place where plant lovers find each other.
2. **Legal compliance is a feature, not a constraint.** Every design decision is checked against SaatG, EU plant health regulations, ZAG, DSA, and GDPR.
3. **Sustainability over growth-hacking.** Plants are living things. Shipping across Europe should be the exception, not the default.
4. **Differentiation through taxonomy.** We understand plants better than generic marketplaces.

### What we are NOT
- We are not a payment processor. Users handle money between themselves (Phase 1).
- We are not a shipping platform. No carrier APIs, no label printing.
- We are not a currency. Reputation points have no monetary value and are not transferable.
- We are not primarily a seed marketplace (see Section 2.1).

---

## 2. Hard Constraints (Legal & Regulatory)

These constraints shape the product. Any feature proposal must be checked against these.

### 2.1 Seed Trading Law (SaatG and EU equivalents)

**In the EU, private individuals may generally not sell or commercially distribute seeds** of most vegetable, crop, or ornamental varieties. This is regulated by EU Directives 2002/53/EC, 2002/55/EC, and national implementations (Germany: SaatG; France: similar rules enforced against Kokopelli; etc.).

**Rule for implementation:**
- Private users: **No seed listings.** Seeds category is disabled for private accounts.
- Commercial users: Seeds allowed, but the seller is responsible for compliance (variety registration, Bundessortenamt or equivalent). We collect a declaration checkbox during listing creation.
- Cuttings and whole plants: Allowed for private users, but subject to plant passport rules (see 2.2).

### 2.2 Plant Health Regulation (EU 2016/2031) – Positive List Approach

Cross-border shipping of live plants within the EU often requires a plant passport issued by a registered professional operator. Private-to-private cross-border shipping is a legal grey zone.

**Our approach: Positive List.**
- Each species in our taxonomy has a `cross_border_allowed` flag.
- The flag is `true` only for species that are generally exempt from plant passport requirements (most common houseplants like Monstera, Pothos, Philodendron, most succulents, etc.).
- For `false` species, cross-border listings are not permitted; the system restricts visibility to the seller's own country.
- The top ~200 species (covering probably 90 %+ of expected listings) are tagged manually at launch; the rest default to `false` until reviewed.

### 2.3 Reputation System – NOT a Currency

Reputation points ("Sprouts" – working name) must:
- **Not be transferable** between users.
- **Not be redeemable** for goods or services with a monetary equivalent.
- **Not be exchangeable** for euros or any other currency.
- Grant only platform-internal benefits (visibility, badges, feature unlocks, tier progression).

Rationale: This keeps us outside the scope of BaFin's KWG (Kryptowerte), ZAG (E-Geld), and the MiCA Regulation. Functionally equivalent to StackOverflow Reputation or Reddit Karma.

### 2.4 EU Regulatory Compliance

The platform operates EU-wide from day one. Baseline compliance:
- **GDPR / DSGVO:** Full compliance. EU-based hosting.
- **Digital Services Act (DSA):** Notice-and-action mechanism, transparent ranking, clear separation of commercial vs. private sellers.
- **Omnibus Directive (2019/2161):** Transparency on commercial status, no fake reviews, ranking transparency.
- **DAC7:** Not currently applicable because we do not process payments. Re-evaluate before any Phase 3 payment integration.
- **VAT / OSS:** For the subscription business, use a Merchant of Record (Paddle or Lemon Squeezy) to handle EU-wide VAT.

### 2.5 Private vs. Commercial Users

Every user account is classified as either `private` or `commercial`. This is a legal distinction, not just a pricing tier.

Commercial accounts must provide:
- Full legal entity name and imprint data
- VAT ID (if applicable)
- Revocation policy for listings
- Visible commercial badge on all listings

---

## 3. Architectural Decisions

### 3.1 Tech Stack (Decided)
- **Framework:** Next.js App Router monolith with API routes
- **ORM:** Drizzle ORM + PostgreSQL
- **Auth:** Auth.js (NextAuth v5) -- self-hosted
- **Styling:** Tailwind CSS
- **i18n:** next-intl (EN + DE)
- **Hosting:** Self-hosted VPS with Docker Compose
- **Search:** Meilisearch (self-hosted)
- **Queue/Jobs:** BullMQ + Redis
- **Object Storage:** Minio (self-hosted)
- **Payment:** Paddle or Lemon Squeezy (only external service)

### 3.2 Monetization – Freemium Subscription Only (MVP)
No commissions, no payment intermediation (Phase 1).

**Free Tier – "Hobbyist":** 10 listings, 20 wishlist, standard Sprouts
**Plus Tier – ~4.99/mo:** 50 listings, unlimited wishlist, 1.5x Sprouts, priority boost
**Pro Tier – ~12.99/mo:** Unlimited listings, analytics, shop page, verified badge

### 3.3 Early-Access Launch Model
All features free at launch. Soft paywall after ~6 months. Founding Members get 50% lifetime discount.

---

## 4. Coding Conventions

- Money: integer cents + currency code. Never float.
- IDs: UUIDv7 throughout.
- Timestamps: UTC in DB, locale conversion in presentation layer only.
- i18n: All user-facing strings through translation layer. No hardcoded English.
- Validation: Server-side always, regardless of client validation.
- Modules: `/modules/{name}/` with schema.ts, service.ts, validators.ts, types.ts
- Cross-module: Well-defined interfaces, not direct DB access.
- Testing: Unit tests for business logic, integration tests for critical flows.
- Commits: Conventional Commits format.
- ADRs: `/docs/adr/` for architectural decisions.

---

## 5. DO NOT List (Hard Prohibitions)

- **DO NOT** build private-user seed sales.
- **DO NOT** implement transferable or redeemable Sprouts.
- **DO NOT** integrate C2C payment intermediation in Phase 1 or 2.
- **DO NOT** integrate carrier/shipping APIs.
- **DO NOT** allow free-text postal addresses in user-to-user messages.
- **DO NOT** store passwords; use Auth.js.
- **DO NOT** remove features from users after launch.
- **DO NOT** use blockchain or crypto-tokens.
- **DO NOT** host outside the EU or use non-GDPR-compliant third parties.
- **DO NOT** log PII.
- **DO NOT** send marketing emails without explicit double-opt-in.

---

## 6. Open TODOs

- [ ] Final product name and domain acquisition
- [ ] Legal entity decision (UG / GmbH / other)
- [x] Tech stack: Next.js monolith + Drizzle + Auth.js
- [ ] Confirm MoR: Paddle vs. Lemon Squeezy
- [ ] Initial tagging of top ~200 species with `cross_border_allowed`
- [ ] ToS, Privacy Policy, Imprint drafts (DE + EN)
- [ ] Brand design: logo, color system, typography
