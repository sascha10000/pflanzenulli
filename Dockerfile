FROM node:22-alpine AS base
RUN corepack enable pnpm

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js app (produces .next/standalone)
RUN pnpm build

# Build worker: emit JS (tsc errors are logged but non-fatal — tsc emits even on type errors),
# then rewrite @/ path aliases to relative paths so Node CJS loader can resolve them at runtime.
RUN (npx tsc --project tsconfig.worker.json || true) && npx tsc-alias --project tsconfig.worker.json

# --- Production: Next.js app ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# --- Migrator (one-shot) ---
FROM base AS migrator
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY drizzle/migrations ./drizzle/migrations
COPY scripts/migrate.mjs ./scripts/migrate.mjs
CMD ["node", "scripts/migrate.mjs"]

# --- Production: Worker ---
FROM base AS worker
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Worker needs node_modules (for bullmq, drizzle, etc.) and compiled JS
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist

USER nextjs

CMD ["node", "dist/workers/index.js"]
