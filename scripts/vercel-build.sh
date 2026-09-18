#!/usr/bin/env bash
set -euo pipefail

npx prisma generate

if [ -n "${DATABASE_URL:-}" ]; then
  if [ -z "${DIRECT_URL:-}" ]; then
    export DIRECT_URL="$DATABASE_URL"
  fi
  npx prisma migrate deploy
else
  echo "Skipping prisma migrate deploy because DATABASE_URL is not set."
fi

npx next build
