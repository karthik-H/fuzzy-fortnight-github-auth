<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-semibold">My Tasks</h1>
      <p class="mt-1 text-sm text-muted">
        Read-only task board for authenticated users.
      </p>
    </div>

    <div v-if="pending" class="text-sm">Loading tasks...</div>
    <div v-else-if="fetchError" class="font-semibold text-red-600">
      {{ fetchError }}
    </div>
    <div v-else-if="!tasks.length" class="text-sm text-muted">
      No tasks yet.
    </div>
    <div v-else class="overflow-hidden rounded-sm border border-emerald-900">
      <table class="w-full text-left text-sm">
        <thead class="bg-emerald-900 text-white">
          <tr>
            <th class="px-4 py-3 font-semibold">Title</th>
            <th class="px-4 py-3 font-semibold">Status</th>
            <th class="px-4 py-3 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="task in tasks"
            :key="task.id"
            class="border-t border-emerald-900/20"
          >
            <td class="px-4 py-3 font-medium">{{ task.title }}</td>
            <td class="px-4 py-3">
              <UBadge
                :label="formatStatus(task.status)"
                :color="statusColor(task.status)"
                variant="subtle"
                class="rounded-sm"
              />
            </td>
            <td class="px-4 py-3 text-muted">
              {{ task.description || '—' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ITaskGet } from '~~/common/types/responses/taskResponse.interface';
import type { TaskStatus } from '~~/common/constants/appConstants';

definePageMeta({
  title: 'Tasks',
  layout: 'default',
  middleware: ['require-user-refetch', 'require-auth'],
});

const { useApi } = useUtils();

const tasks = ref<ITaskGet[]>([]);
const pending = ref(true);
const fetchError = ref<string | null>(null);

const formatStatus = (status: TaskStatus) =>
  status.replaceAll('_', ' ').toLowerCase();

const statusColor = (status: TaskStatus) => {
  if (status === 'DONE') return 'success';
  if (status === 'IN_PROGRESS') return 'warning';
  return 'neutral';
};

onMounted(async () => {
  const response = await useApi<ITaskGet[]>({
    apiPath: '/api/tasks',
    method: 'GET',
  });

  pending.value = false;

  if (response.success) {
    tasks.value = response.data;
  } else {
    fetchError.value = response.message || 'Failed to load tasks';
  }
});
</script>
