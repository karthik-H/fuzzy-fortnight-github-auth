export type Role = 'ADMIN' | 'DEVELOPER';

export const Role = {
  ADMIN: 'ADMIN' as const,
  DEVELOPER: 'DEVELOPER' as const,
};

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export const TaskStatus = {
  TODO: 'TODO' as const,
  IN_PROGRESS: 'IN_PROGRESS' as const,
  DONE: 'DONE' as const,
};

export type TColorMode = 'dark' | 'light' | 'system';

export type TUserPreferences = {
  system: {
    landingPage: {
      role: 'ADMIN' | 'DEVELOPER';
      default: string;
    };
    colorMode: TColorMode;
  };
};

export const DEFAULT_USER_DEVELOPER_PREFERENCES: TUserPreferences = {
  system: {
    landingPage: {
      role: 'DEVELOPER',
      default: '',
    },
    colorMode: 'light',
  },
};

export const DEFAULT_USER_ADMIN_PREFERENCES: TUserPreferences = {
  system: {
    landingPage: {
      role: 'ADMIN',
      default: '',
    },
    colorMode: 'light',
  },
};
