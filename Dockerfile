ARG DOCKER_REGISTRY
# ARG HTTP_PROXY= ${HTTP_PROXY:-}
# ARG HTTPS_PROXY= ${HTTP_PROXY:-}
# ARG NO_PROXY=localhost,127.0.0.1,::1,*.local,deb.debian.org,security.debian.org



FROM ${DOCKER_REGISTRY}node:18


WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production

# Copiar el build standalone
COPY .next/standalone ./

# Copiar public
COPY public ./public

# Copiar archivos necesarios
COPY next.config.ts ./

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]