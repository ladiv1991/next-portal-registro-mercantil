# ===== PRODUCTION: pre-built standalone, offline-safe =====
FROM oven/bun:1.4.4-debian AS runner
ENV NODE_ENV=production PORT=3000

RUN /usr/sbin/groupadd --system nodejs && /usr/sbin/useradd --system --gid nodejs --uid 1001 nextjs

WORKDIR /app

# Standalone output already bundles all node_modules required at runtime
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public
# Prisma schema + migrations (applied on host before build — no CLI needed)
COPY --chown=nextjs:nodejs prisma ./prisma
COPY --chown=nextjs:nodejs package.json ./package.json

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Production: migrations already applied, start server directly.
CMD ["node", "server.js"]
