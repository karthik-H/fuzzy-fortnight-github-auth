import type { Role, TUserPreferences } from '~~/common/constants/appConstants';

export type UserCookie = {
  id: number;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  preferences?: TUserPreferences;
};
