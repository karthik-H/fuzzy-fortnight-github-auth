<template>
  <div class="flex min-h-screen w-full flex-row items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <h1 class="text-2xl font-semibold">TaskFlow</h1>
      <p v-if="error" class="text-3xl text-red-600">{{ error }}</p>
      <UButton
        v-if="error"
        variant="solid"
        size="lg"
        class="rounded-sm"
        @click="navigateTo('/login')"
      >
        Return to Login
      </UButton>
      <p v-else class="text-3xl">Logging you in with GitHub...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IUserSelfGet } from '~~/common/types/responses/userResponse.interface';

definePageMeta({
  title: 'Logging in...',
  layout: 'empty',
});

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { useApi } = useUtils();

const error = ref<string | null>(null);

onMounted(async () => {
  const code = route.query.code as string;
  if (!code) {
    error.value = 'Missing GitHub authorization code.';
    return;
  }

  const response = await useApi<IUserSelfGet>({
    apiPath: '/api/auth/github/callback',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: { code },
  });

  if (response.success) {
    useCookie('token').value = response.data.token;
    router.push('/');
  } else {
    error.value = response.message || 'GitHub login failed';
    toast.add({
      title: response.message,
      color: 'error',
      duration: 3000,
    });
  }
});
</script>
