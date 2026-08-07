import { defineStore } from 'pinia';
import type { UserCookie } from '~/types/cookie';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserCookie | null,
  }),
  actions: {
    setUser(user: UserCookie | null) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
    },
  },
});
