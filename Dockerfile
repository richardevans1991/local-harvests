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
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000
VOLUME ["/app/prisma"]

RUN chmod +x scripts/docker-entrypoint.sh
CMD ["./scripts/docker-entrypoint.sh"]