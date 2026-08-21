ARG DOCKER_REGISTRY
# ARG HTTP_PROXY= ${HTTP_PROXY:-}
# ARG HTTPS_PROXY= ${HTTP_PROXY:-}
# ARG NO_PROXY=localhost,127.0.0.1,::1,*.local,deb.debian.org,security.debian.org

FROM ${DOCKER_REGISTRY}node:20

WORKDIR /app

# Install dependencies needed to build the Next.js app.
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source and build the production artifact inside the image.
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

ENV PORT=3000

CMD ["node", ".next/standalone/server.js"]