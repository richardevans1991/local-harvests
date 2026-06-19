FROM node:20-alpine
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
VOLUME ["/app/prisma"]

RUN chmod +x scripts/docker-entrypoint.sh
CMD ["./scripts/docker-entrypoint.sh"]