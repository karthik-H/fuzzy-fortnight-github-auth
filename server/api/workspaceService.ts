import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type WorkspaceUser = {
  id: number;
  email: string;
  name: string;
};

async function loadMockWorkspaceUsers(): Promise<WorkspaceUser[]> {
  const snapshotPath = resolve(process.cwd(), 'mocks', 'workspace', 'users.json');
  const raw = await readFile(snapshotPath, 'utf-8');
  return JSON.parse(raw) as WorkspaceUser[];
}

function loadAllowlistUsers(): WorkspaceUser[] {
  const allowlist = (process.env.ALLOWED_WORKSPACE_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.map((email, index) => ({
    id: index + 1,
    email,
    name: email.split('@')[0] || email,
  }));
}

/**
 * Stands in for the customer Toggl workspace email gate.
 * MOCK_WORKSPACE=true → mocks/workspace/users.json
 * otherwise → ALLOWED_WORKSPACE_EMAILS allowlist
 */
export async function resolveWorkspaceMemberIdByEmail(
  email: string,
): Promise<number> {
  const useMock = process.env.MOCK_WORKSPACE === 'true';

  let users: WorkspaceUser[];
  try {
    users = useMock ? await loadMockWorkspaceUsers() : loadAllowlistUsers();
  } catch {
    throw createError({
      statusCode: 503,
      statusMessage:
        'Failed to login user via GitHub SSO: Error fetching workspace users',
    });
  }

  const matched = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );

  if (!matched) {
    throw createError({
      statusCode: 403,
      statusMessage:
        'Failed to login user via GitHub SSO: No workspace user matches this email',
    });
  }

  return matched.id;
}
