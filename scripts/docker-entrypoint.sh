#!/bin/sh
set -e

mkdir -p "${UPLOAD_DIR:-/app/data/uploads}"

npx prisma migrate deploy

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "SEED_ON_START is enabled — seed runs only on an empty database."
  npx prisma db seed
fi

if [ "${REMOVE_DEMOS_ON_START:-true}" = "true" ]; then
  echo "Removing seeded demo farms (real farms are never touched)..."
  npx tsx scripts/remove-demo-farms.ts || true
fi

exec npm start