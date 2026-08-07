import type { Prisma } from '@prisma/client';
import type { Role } from '~~/common/constants/appConstants';

export interface IUserDb {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  isArchived: boolean;
  preferences: Prisma.JsonValue | null;
  workspaceMemberId: number;
  auth0_user_id: string | null;
  githubAccessToken: string | null;
}

export interface IUserWithPasswordDb extends IUserDb {
  password: string;
}
