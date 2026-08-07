import type { IGithubCallbackPost } from '~~/common/types/requests/githubRequest.interface';
import type {
  IUserLoginPost,
  IUserRegisterPost,
  IUserSelfPost,
} from '~~/common/types/requests/userRequest.interface';
import type { TUserPreferences } from '~~/common/constants/appConstants';

export function isUserLoginPostValid(
  object: unknown,
): object is IUserLoginPost {
  return (
    object !== null &&
    typeof object === 'object' &&
    typeof (object as IUserLoginPost).email === 'string' &&
    typeof (object as IUserLoginPost).password === 'string'
  );
}

export function isUserSelfPostValid(object: unknown): object is IUserSelfPost {
  return (
    object !== null &&
    typeof object === 'object' &&
    typeof (object as IUserSelfPost).token === 'string'
  );
}

export function isUserRegisterPostValid(
  object: unknown,
): object is IUserRegisterPost {
  return (
    object !== null &&
    typeof object === 'object' &&
    typeof (object as IUserRegisterPost).name === 'string' &&
    typeof (object as IUserRegisterPost).email === 'string' &&
    typeof (object as IUserRegisterPost).password === 'string' &&
    typeof (object as IUserRegisterPost).confirmPassword === 'string'
  );
}

export function isGithubCallbackPostValid(
  object: unknown,
): object is IGithubCallbackPost {
  return (
    object !== null &&
    typeof object === 'object' &&
    typeof (object as IGithubCallbackPost).code === 'string'
  );
}

export function isUserPreferenceValid(
  object: unknown,
): object is TUserPreferences {
  if (object === null || typeof object !== 'object') {
    return false;
  }

  const prefs = object as TUserPreferences;
  return (
    typeof prefs.system?.landingPage?.role === 'string' &&
    typeof prefs.system?.landingPage?.default === 'string' &&
    typeof prefs.system?.colorMode === 'string'
  );
}
