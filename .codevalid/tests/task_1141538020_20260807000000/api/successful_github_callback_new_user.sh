#!/usr/bin/env sh
set -eu
BASE_URL="${BASE_URL:-http://app:6713}"
DATABASE_URL="${DATABASE_URL:-mysql://app:app@toxiproxy:3306/appdb}"
CASE_SUFFIX="$(date +%s)-$$"
TEST_ID="successful_github_callback_new_user"
USER_EMAIL="github.user@example.com"
REQUEST_BODY_FILE="/tmp/${TEST_ID}_request_${CASE_SUFFIX}.json"
RESPONSE_HEADERS_FILE="/tmp/${TEST_ID}_response_headers_${CASE_SUFFIX}.txt"
RESPONSE_BODY_FILE="/tmp/${TEST_ID}_response_body_${CASE_SUFFIX}.json"
COOKIE_JAR="/tmp/${TEST_ID}_cookies_${CASE_SUFFIX}.txt"
cleanup_files() {
  rm -f "$REQUEST_BODY_FILE" "$RESPONSE_HEADERS_FILE" "$RESPONSE_BODY_FILE" "$COOKIE_JAR"
}
trap cleanup_files EXIT
# Obtain a real mock-oauth2-server auth code via interactive login (username → claim map).
obtain_github_auth_code() {
  subject="$1"
  auth_base="${GITHUB_OAUTH_AUTHORIZATION_URL:-http://toxiproxy:9101/github/authorize}"
  redirect_uri="${GITHUB_REDIRECT_URI:-http://app:6713/auth/github/callback}"
  client_id="${GITHUB_CLIENT_ID:-seed-github-client-id}"
  oauth_jar="/tmp/${TEST_ID}_oauth_jar_${CASE_SUFFIX}.txt"
  oauth_hdr="/tmp/${TEST_ID}_oauth_hdr_${CASE_SUFFIX}.txt"
  oauth_body="/tmp/${TEST_ID}_oauth_body_${CASE_SUFFIX}.html"
  rm -f "$oauth_jar" "$oauth_hdr" "$oauth_body"
  auth_url=$(AUTH_BASE="$auth_base" CLIENT_ID="$client_id" REDIRECT_URI="$redirect_uri" python3 - <<'PY'
import os
from urllib.parse import urlencode
print(os.environ["AUTH_BASE"] + "?" + urlencode({
    "response_type": "code",
    "client_id": os.environ["CLIENT_ID"],
    "redirect_uri": os.environ["REDIRECT_URI"],
    "scope": "openid email profile",
    "state": "codevalid",
}))
PY
)
  curl -sS -c "$oauth_jar" -b "$oauth_jar" -o /dev/null "$auth_url"
  curl -sS -c "$oauth_jar" -b "$oauth_jar" -D "$oauth_hdr" -o "$oauth_body" -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "username=${subject}" \
    "$auth_url"
  code=$(OAUTH_HDR="$oauth_hdr" OAUTH_BODY="$oauth_body" python3 - <<'PY'
import os, re
t = open(os.environ["OAUTH_HDR"]).read() + "\n" + open(os.environ["OAUTH_BODY"]).read()
m = re.search(r"[?&]code=([^&\s\"#]+)", t)
print(m.group(1) if m else "")
PY
)
  if [ -z "$code" ]; then
    echo "PREREQ_FAILED: could not obtain authorization code for subject=${subject}"
    echo "OAUTH_HEADERS:"
    cat "$oauth_hdr" || true
    exit 1
  fi
  printf '%s' "$code"
}


echo "STEP: Given — ensure no pre-existing GitHub user row exists for allowlisted email"
echo "PREREQ: deleting any existing user with email ${USER_EMAIL}"
mysql "$DATABASE_URL" -e "DELETE FROM User WHERE email='${USER_EMAIL}';"
echo "PREREQ: obtaining real authorization code from mock IdP (subject=workspace)"
code="$(obtain_github_auth_code workspace)"
printf '{"code":"%s"}' "$code" > "$REQUEST_BODY_FILE"

echo "STEP: When — POST GitHub callback with a valid seeded authorization code for a new user"
echo "REQUEST_HEADERS: Content-Type: application/json"
echo "REQUEST_BODY: $(cat "$REQUEST_BODY_FILE")"
status=$(curl -sS -D "$RESPONSE_HEADERS_FILE" -o "$RESPONSE_BODY_FILE" -w '%{http_code}' -c "$COOKIE_JAR" -b "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/github/callback" -H 'Content-Type: application/json' --data @"$REQUEST_BODY_FILE")
echo "RESPONSE_STATUS: $status"
echo "RESPONSE_HEADERS:"
cat "$RESPONSE_HEADERS_FILE"
echo "RESPONSE_BODY:"
cat "$RESPONSE_BODY_FILE"

echo "STEP: Then — assert new user login succeeded, session cookies were set, and response contains allowlisted email"
[ "$status" = "200" ] || { echo "ASSERTION_FAILED: expected HTTP 200 got ${status}"; exit 1; }
grep -F 'Successfully login user via GitHub SSO' "$RESPONSE_BODY_FILE" >/dev/null || { echo "ASSERTION_FAILED: expected success message in response body"; exit 1; }
grep -F '"success":true' "$RESPONSE_BODY_FILE" >/dev/null || { echo "ASSERTION_FAILED: expected success true in response body"; exit 1; }
grep -F '"email":"github.user@example.com"' "$RESPONSE_BODY_FILE" >/dev/null || { echo "ASSERTION_FAILED: expected response data email github.user@example.com"; exit 1; }
grep -F '"token":"' "$RESPONSE_BODY_FILE" >/dev/null || { echo "ASSERTION_FAILED: expected JWT token field in response body"; exit 1; }
grep -i '^set-cookie: token=' "$RESPONSE_HEADERS_FILE" >/dev/null || { echo "ASSERTION_FAILED: expected Set-Cookie header for token"; exit 1; }
grep -i '^set-cookie: githubToken=' "$RESPONSE_HEADERS_FILE" >/dev/null || { echo "ASSERTION_FAILED: expected Set-Cookie header for githubToken"; exit 1; }
grep -i '^set-cookie: user=' "$RESPONSE_HEADERS_FILE" >/dev/null || { echo "ASSERTION_FAILED: expected Set-Cookie header for user"; exit 1; }

echo "STEP: Cleanup — remove created user row for allowlisted email"
echo "PREREQ: deleting user row created by successful callback"
mysql "$DATABASE_URL" -e "DELETE FROM User WHERE email='${USER_EMAIL}';"
echo "CODEVALID_TEST_ASSERTION_OK:successful_github_callback_new_user"
