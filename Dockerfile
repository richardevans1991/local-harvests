FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:./prisma/dev.db"
ENV AUTH_SECRET="build-placeholder"
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:/app/data/dev.db"
ENV UPLOAD_DIR="/app/data/uploads"

EXPOSE 3000

RUN chmod +x scripts/docker-entrypoint.sh
CMD ["./scripts/docker-entrypoint.sh"]