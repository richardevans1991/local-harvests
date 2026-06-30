#!/bin/sh
set -e

mkdir -p /app/data
mkdir -p "${UPLOAD_DIR:-/app/data/uploads}"

npx prisma migrate deploy

if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "SEED_ON_START is enabled — seed runs only on an empty database."
  npx prisma db seed
fi

exec npm start