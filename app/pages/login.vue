<template>
  <form @submit.prevent="login">
    <div class="mx-auto w-full max-w-4xl p-5">
      <UCard class="rounded-sm">
        <template #header>
          <h1 class="text-2xl font-semibold">Sign in to TaskFlow</h1>
          <p class="text-sm text-muted">
            Email/password or GitHub SSO (workspace-gated)
          </p>
        </template>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div class="space-y-4 md:col-span-1">
            <UFormField label="Email" size="xl" required>
              <UInput
                v-model="email"
                type="email"
                placeholder="you@example.com"
                icon="i-heroicons-envelope"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Password" size="xl" required>
              <UInput
                v-model="password"
                type="password"
                icon="i-heroicons-lock-closed"
                class="w-full"
              />
            </UFormField>
            <UButton
              variant="solid"
              size="lg"
              type="submit"
              class="mt-2 w-fit rounded-sm px-4"
            >
              Login
            </UButton>
            <div v-if="loginError" class="font-bold text-red-600">
              {{ loginError }}
            </div>
            <p class="text-sm">
              No account?
              <NuxtLink to="/register" class="underline">Register</NuxtLink>
            </p>
          </div>

          <div class="flex items-center justify-center md:col-span-1">
            <USeparator label="OR" orientation="vertical" class="hidden h-40 md:block" />
            <USeparator label="OR" class="w-full md:hidden" />
          </div>

          <div class="flex flex-col items-start justify-center md:col-span-1">
            <GithubSignInButton @click="handleGithubLogin" />
          </div>
        </div>
      </UCard>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { IUserSelfGet } from '~~/common/types/responses/userResponse.interface';
import type { UserCookie } from '~/types/cookie';

definePageMeta({
  title: 'Login',
  layout: 'public',
  middleware: 'no-auth-required',
});

const { useApi } = useUtils();
const toast = useToast();
const router = useRouter();
const config = useRuntimeConfig();

const GITHUB_CLIENT_ID = config.public.githubClientId;
const GITHUB_OAUTH_AUTHORIZATION_URL = config.public.githubOauthAuthorizationUrl;

const email = ref('');
const password = ref('');
const loginError = ref<string | null>(null);

const login = async () => {
  const response = await useApi<IUserSelfGet>({
    apiPath: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      email: email.value,
      password: password.value,
    },
  });

  if (response.success) {
    router.push('/');
  } else {
    loginError.value =
      (response.error as { statusMessage?: string })?.statusMessage ||
      response.message;
    toast.add({
      title: response.message,
      color: 'error',
      duration: 3000,
    });
  }
};

const handleGithubLogin = () => {
  if (!GITHUB_CLIENT_ID) {
    loginError.value = 'GITHUB_CLIENT_ID is not configured';
    return;
  }

  const user = useCookie<UserCookie | null>('user');
  const redirectUri = `${window.location.origin}/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
  });

  if (user.value?.email) {
    params.append('login', user.value.email);
  }

  window.location.href = `${GITHUB_OAUTH_AUTHORIZATION_URL}?${params.toString()}`;
};
</script>
