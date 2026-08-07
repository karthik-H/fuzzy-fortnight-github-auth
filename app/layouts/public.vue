<template>
  <header class="sticky top-0 z-10">
    <div
      class="flex items-center justify-between bg-emerald-900 px-6 py-4 text-cream-100"
    >
      <NuxtLink to="/" class="text-xl font-semibold tracking-wide text-white">
        TaskFlow
      </NuxtLink>
      <slot name="actions" />
    </div>
  </header>
  <div id="main-content">
    <ClientOnly>
      <slot />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

useHead({
  title: `TaskFlow - ${route.meta.title || 'App'}`,
});
</script>
