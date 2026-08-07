#!/usr/bin/env bash
# .codevalid/entrypoint.sh — wait for deps, migrate, exec server (§3.7)
set -euo pipefail

# 1. Wait for each dependency *through toxiproxy*
for hp in ${WAIT_FOR_TCP:-}; do
  host="${hp%%:*}"; port="${hp##*:}"
  echo "waiting for ${host}:${port} ..."
  until nc -z "$host" "$port"; do sleep 1; done
  echo "${host}:${port} is up"
done

# 2. Run migrations through toxiproxy (PRISMA_DATABASE_CONNECTION_URL already points at toxiproxy:3306)
${MIGRATE_CMD:-true}

# 3. Hand off to the real server on 6713
exec "$@"
