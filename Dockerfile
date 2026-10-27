ARG DOCKER_REGISTRY

# ===== DEPS STAGE =====
FROM ${DOCKER_REGISTRY}node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund

# ===== BUILD STAGE =====
FROM ${DOCKER_REGISTRY}node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV NODE_ENV=production
RUN npx next build

# ===== RUNTIME STAGE =====
FROM ${DOCKER_REGISTRY}node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production PORT=3000

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# All node_modules for client-side deps
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
# Prisma schema + seed files
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# tsconfig + src/lib needed for seed to resolve @/ path aliases
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=nextjs:nodejs /app/src/lib ./src/lib
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate; bun run prisma/seed.ts; node server.js"]
