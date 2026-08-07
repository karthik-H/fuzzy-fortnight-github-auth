#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="${HEALTH_URL:-http://app:6713/api/health}"
MOCK_OAUTH_ISALIVE_URL="${MOCK_OAUTH_ISALIVE_URL:-http://mock-oauth2-server:8080/isalive}"

# Assert app health
code="$(curl -s -o /dev/null -w '%{http_code}' "$HEALTH_URL")"
if [ "$code" != "200" ]; then
  echo "health failed: HTTP $code"; exit 1
fi

# Assert mock-oauth2-server liveness
mock_code="$(curl -s -o /dev/null -w '%{http_code}' "$MOCK_OAUTH_ISALIVE_URL")"
if [ "$mock_code" != "200" ]; then
  echo "mock-oauth2-server /isalive failed: HTTP $mock_code"; exit 1
fi

echo "${SEED_ASSERTION_MESSAGE:-CODEVALID_SEED_OK}"
