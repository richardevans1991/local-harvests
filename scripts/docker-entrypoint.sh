#!/bin/sh
set -e

mkdir -p /app/data
mkdir -p "${UPLOAD_DIR:-/app/data/uploads}"

# Always use the mounted volume for SQLite in Docker/Railway unless explicitly overridden.
case "${DATABASE_URL:-}" in
  "" | "file:./prisma/dev.db" | "file:./dev.db")
    export DATABASE_URL="file:/app/data/dev.db"
    echo "DATABASE_URL → ${DATABASE_URL} (persisted volume)"
    ;;
esac

# One-time recovery if data was written to a non-persisted path on a previous deploy.
if [ ! -f /app/data/dev.db ]; then
  if [ -f /app/prisma/dev.db ]; then
    echo "Recovering database from /app/prisma/dev.db → /app/data/dev.db"
    cp /app/prisma/dev.db /app/data/dev.db
  elif [ -f /app/dev.db ]; then
    echo "Recovering database from /app/dev.db → /app/data/dev.db"
    cp /app/dev.db /app/data/dev.db
  fi
fi

npx prisma migrate deploy

if [ "${SEED_ON_START:-false}" = "true" ]; then
  if [ "${NODE_ENV:-}" = "production" ]; then
    echo "WARNING: SEED_ON_START is enabled in production — only runs on an empty database."
  fi
  echo "SEED_ON_START is enabled — seed runs only on an empty database."
  npx prisma db seed
fi

node scripts/startup-db-check.cjs

exec npm start