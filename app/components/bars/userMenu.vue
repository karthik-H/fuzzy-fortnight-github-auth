<template>
  <div class="flex items-center gap-3">
    <span class="text-sm text-white/90">{{ user?.name || user?.email }}</span>
    <UButton color="neutral" variant="soft" size="sm" @click="logout">
      Logout
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { UserCookie } from '~/types/cookie';

const router = useRouter();
const toast = useToast();
const user = useCookie<UserCookie | null>('user');
const { clearUserSession } = useUserSession();
const { useApi } = useUtils();

const logout = async () => {
  const response = await useApi<boolean>({
    apiPath: '/api/auth/logout',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  await clearUserSession();

  if (!response.success) {
    toast.add({
      title: response.message || 'Logout failed',
      color: 'error',
    });
  }

  router.push('/login');
};
</script>
