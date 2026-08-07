import type { Role, TUserPreferences } from '../../constants/appConstants';

export interface IUserSelfGet {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  token?: string;
  preferences: TUserPreferences | null;
}
