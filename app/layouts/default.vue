<template>
  <header class="sticky top-0 z-10">
    <div
      class="flex items-center justify-between bg-emerald-900 px-6 py-4 text-white"
    >
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="text-xl font-semibold tracking-wide">
          TaskFlow
        </NuxtLink>
        <UBadge
          v-if="user?.role"
          :label="user.role"
          color="secondary"
          size="md"
          class="rounded-sm font-semibold text-highlighted"
        />
      </div>
      <UserMenu />
    </div>
  </header>
  <div id="main-content">
    <ClientOnly>
      <slot />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import type { UserCookie } from '~/types/cookie';

const user = useCookie<UserCookie | null>('user');
const route = useRoute();

useHead({
  title: `TaskFlow - ${route.meta.title || 'Tasks'}`,
});
</script>
