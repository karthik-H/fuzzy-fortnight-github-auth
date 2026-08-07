// Minimal health check endpoint required by CodeValid infra (§1.1).
// Responds 200 on GET /health when the server is up.
export default defineEventHandler(() => {
  return { status: 'ok' };
});
