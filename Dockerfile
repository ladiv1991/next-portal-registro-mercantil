# ===== PRODUCTION: pre-built standalone, offline-safe =====
# Usa oven/bun desde Harbor (no requiere acceso a Docker Hub)
FROM registry.dev.xetid.cu/portales-web/oven-bun:1.4.4-debian AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0

RUN /usr/sbin/groupadd --system nodejs 2>/dev/null || true && \
    /usr/sbin/useradd --system --gid nodejs --uid 1001 nextjs 2>/dev/null || true

WORKDIR /app

# Standalone output already bundles all node_modules required at runtime
COPY --chown=nextjs:nodejs .next/standalone ./

# Next.js expects static chunks at .next/standalone/.next/static/
# and public assets at .next/standalone/public/
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public

# Prisma schema + migrations (applied on host before build — no CLI needed)
COPY --chown=nextjs:nodejs prisma ./prisma
COPY --chown=nextjs:nodejs package.json ./package.json

# Turbopack externaliza @prisma/client con un id con hash (p.ej. @prisma/client-<hash>);
# se crea el alias para que require() lo resuelva dentro del contenedor.
RUN for id in $(grep -rhoE '@prisma/client-[a-f0-9]+' .next/server/chunks | sort -u); do \
      ln -sfn client "node_modules/@prisma/${id#@prisma/}"; done

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD bun -e "await fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Production: migrations already applied, start server directly.
CMD ["node", "server.js"]
