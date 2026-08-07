# fuzzy-fortnight-github-auth

Nuxt 4 / Prisma / MySQL task app focused on **email/password + GitHub OAuth** (authorization-code SSO with a stub workspace allowlist).

## Stack

- Nuxt 4 + Vue 3 + Nuxt UI + Tailwind CSS v4
- Prisma 6 + MySQL
- bcrypt + jsonwebtoken (8h JWT in cookies)
- GitHub OAuth (`read:user user:email`) with workspace email gate (`mocks/workspace/users.json` or `ALLOWED_WORKSPACE_EMAILS`)

## Setup (app)

1. Create a local MySQL database (e.g. `taskflow`).
2. Create a GitHub OAuth App (see below) and fill `.env`.
3. Install and migrate:

```bash
cp .env.example .env
# fill PRISMA_DATABASE_CONNECTION_URL, JWT_SECRET, and GITHUB_* values

npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

App defaults to `http://localhost:3000` (or `APP_PORT`).

## Create a GitHub OAuth App

1. Open [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers) → **New OAuth App**.
2. Fill in:
   - **Application name:** `TaskFlow Local` (or anything)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/auth/github/callback`
3. Click **Register application**.
4. Copy the **Client ID** into `GITHUB_CLIENT_ID`.
5. Click **Generate a new client secret**, copy it into `GITHUB_CLIENT_SECRET`.
6. Keep `GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback` (must match the callback URL exactly).

### Workspace allowlist

After GitHub returns the user’s email, the app checks it against the workspace gate:

- `MOCK_WORKSPACE=true` (default) → email must exist in `mocks/workspace/users.json`
- otherwise → email must be in `ALLOWED_WORKSPACE_EMAILS`

Add your real GitHub account email to `mocks/workspace/users.json` (or the allowlist) or SSO will return **403**.

Example:

```json
{ "id": 1004, "email": "you@example.com", "name": "Your Name" }
```

## Seeded users (email/password)

| Email | Password | Role |
|-------|----------|------|
| `admin@example.com` | `Password123!` | ADMIN |
| `dev@example.com` | `Password123!` | DEVELOPER |

## CodeValid / mock IdP

DinD ground truth lives under `.codevalid/` (compose + mock-oauth2-server issuer `github` + toxiproxy).

```bash
cd .codevalid
docker compose up -d --build
docker compose --profile test run --rm seed-test
docker compose --profile test run --rm --entrypoint /bin/bash seed-test \
  tests/task_1141538020_20260807000000/api/successful_github_callback_new_user.sh
```

App env seams for the mock IdP: `GITHUB_OAUTH_AUTHORIZATION_URL`, `GITHUB_OAUTH_TOKEN_URL`, `GITHUB_OAUTH_USERINFO_URL` (OIDC userinfo stands in for GitHub `/user`).

## Auth flow

1. Login page redirects to GitHub authorize (`scope=read:user user:email`).
2. GitHub redirects to `/auth/github/callback?code=...`.
3. Frontend POSTs the code to `/api/auth/github/callback`.
4. Backend exchanges the code for an access token, fetches `/user` (+ `/user/emails` if needed), runs the workspace gate, upserts the user, and sets `token`, `githubToken`, and `user` cookies.

## Auth routes

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/login` | Email/password; sets `token` + `user` cookies |
| POST | `/api/auth/register` | Create password user |
| POST | `/api/auth/logout` | Clears cookies |
| POST | `/api/auth/me` | Refresh session |
| POST | `/api/auth/github/callback` | Exchange OAuth code; sets `token`, `githubToken`, `user` |
| GET | `/api/tasks` | Authenticated; own tasks (read-only) |

Authenticated home `/` is a read-only task list.

## Env reference

| Variable | Role |
|----------|------|
| `PRISMA_DATABASE_CONNECTION_URL` | MySQL connection |
| `JWT_SECRET` | Sign session JWTs |
| `APP_PORT` | Dev server port (default 3000) |
| `GITHUB_CLIENT_ID` | OAuth App client ID (public) |
| `GITHUB_CLIENT_SECRET` | OAuth App client secret |
| `GITHUB_REDIRECT_URI` | Must match the OAuth App callback URL |
| `GITHUB_OAUTH_AUTHORIZATION_URL` | Optional; default `https://github.com/login/oauth/authorize` |
| `GITHUB_OAUTH_TOKEN_URL` | Optional; default `https://github.com/login/oauth/access_token` |
| `GITHUB_API_BASE_URL` | Optional; default `https://api.github.com` |
| `MOCK_WORKSPACE` | `true` → use `mocks/workspace/users.json` |
| `ALLOWED_WORKSPACE_EMAILS` | Comma list when mock is off |
