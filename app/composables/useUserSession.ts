import { computed, toRaw } from 'vue';
import type { UserCookie } from '~/types/cookie';
import { Role, type TUserPreferences } from '~~/common/constants/appConstants';
import type { IUserSelfGet } from '~~/common/types/responses/userResponse.interface';

export const useUserSession = () => {
  const token = useCookie('token');
  const user = useCookie<UserCookie | null>('user');
  const { useApi } = useUtils();

  const isLoggedIn = computed(() => !!toRaw(user.value));
  const isAdmin = computed(() => user.value && user.value.role === Role.ADMIN);
  const isDeveloper = computed(
    () => user.value && user.value.role === Role.DEVELOPER,
  );
  const userPreferences = computed<TUserPreferences | null>(
    () => user.value?.preferences ?? null,
  );

  async function me(): Promise<boolean> {
    if (!token.value) {
      return false;
    }

    const response = await useApi<IUserSelfGet>({
      apiPath: '/api/auth/me',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { token: token.value },
    });

    return response.success;
  }

  async function clearUserSession() {
    user.value = null;
    token.value = null;
  }

  function handleUnauthorized() {
    user.value = null;
    token.value = null;

    if (import.meta.client) {
      navigateTo('/login');
    }
  }

  return {
    isLoggedIn,
    isAdmin,
    isDeveloper,
    userPreferences,
    me,
    clearUserSession,
    handleUnauthorized,
  };
};
