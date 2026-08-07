<template>
  <form @submit.prevent="register">
    <div class="mx-auto w-full max-w-xl p-5">
      <UCard class="rounded-sm">
        <template #header>
          <h1 class="text-2xl font-semibold">Create a TaskFlow account</h1>
        </template>

        <div class="space-y-4">
          <UFormField label="Name" size="xl" required>
            <UInput v-model="name" type="text" class="w-full" />
          </UFormField>
          <UFormField label="Email" size="xl" required>
            <UInput v-model="email" type="email" class="w-full" />
          </UFormField>
          <UFormField label="Password" size="xl" required>
            <UInput v-model="password" type="password" class="w-full" />
          </UFormField>
          <UFormField label="Confirm password" size="xl" required>
            <UInput v-model="confirmPassword" type="password" class="w-full" />
          </UFormField>

          <UButton variant="solid" size="lg" type="submit" class="rounded-sm">
            Register
          </UButton>

          <div v-if="error" class="font-bold text-red-600">{{ error }}</div>

          <p class="text-sm">
            Already registered?
            <NuxtLink to="/login" class="underline">Login</NuxtLink>
          </p>
        </div>
      </UCard>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { IUserSelfGet } from '~~/common/types/responses/userResponse.interface';

definePageMeta({
  title: 'Register',
  layout: 'public',
  middleware: 'no-auth-required',
});

const { useApi } = useUtils();
const toast = useToast();
const router = useRouter();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref<string | null>(null);

const register = async () => {
  const response = await useApi<IUserSelfGet>({
    apiPath: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      name: name.value,
      email: email.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    },
  });

  if (response.success) {
    toast.add({
      title: 'Account created — please log in',
      color: 'success',
    });
    router.push('/login');
  } else {
    error.value =
      (response.error as { statusMessage?: string })?.statusMessage ||
      response.message;
    toast.add({
      title: response.message,
      color: 'error',
    });
  }
};
</script>
