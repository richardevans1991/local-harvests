#!/bin/sh
set -e

mkdir -p "${UPLOAD_DIR:-/app/data/uploads}"

npx prisma migrate deploy

if [ "${SEED_ON_START:-false}" = "true" ]; then
  npx prisma db seed
fi

exec npm start