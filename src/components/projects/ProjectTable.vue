<template>
  <BaseTable :config="config" @row-click="emit('select', $event.id)">
    <template #name="{ row }">
      <span class="cell-name__title">{{ row.name }}</span>
      <span v-if="row.description" class="cell-name__desc">{{ row.description }}</span>
    </template>

    <template #taskCount="{ row }">
      {{ tasksStore.countByProject(row.id) }}
    </template>

    <template #status="{ row }">
      <StatusBadge :status="row.status" />
    </template>

    <template #createdAt="{ row }">
      {{ formatDate(row.createdAt) }}
    </template>

    <template #actions="{ row }">
      <button class="icon-btn" title="Редагувати" @click.stop="emit('edit', row)">✎</button>
      <button class="icon-btn" title="Видалити" @click.stop="emit('remove', row.id)">🗑</button>
    </template>
  </BaseTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '@/types/project'
import type { TableConfig } from '@/types/table'
import BaseTable from '@/components/common/BaseTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { useTasksStore } from '@/stores/tasks'

const props = defineProps<{ projects: Project[] }>()
const emit = defineEmits<{
  select: [id: number]
  edit: [project: Project]
  remove: [id: number]
}>()

const tasksStore = useTasksStore()

// Column definitions are static — only the rows change.
const columns: TableConfig<Project>['columns'] = [
  { key: 'id', label: 'ID', width: 90, sortable: true, sortAccessor: (p) => p.id },
  { key: 'name', label: 'Назва проекту', width: 320, sortable: true, sortAccessor: (p) => p.name },
  {
    key: 'taskCount',
    label: 'Завдань',
    width: 120,
    sortable: true,
    sortAccessor: (p) => tasksStore.countByProject(p.id),
  },
  { key: 'status', label: 'Статус', width: 150, sortable: true, sortAccessor: (p) => p.status },
  {
    key: 'createdAt',
    label: 'Дата створення',
    width: 180,
    sortable: true,
    sortAccessor: (p) => Date.parse(p.createdAt),
  },
]

const config = computed<TableConfig<Project>>(() => ({
  rows: props.projects,
  clickableRows: true,
  resizable: true,
  storageKey: 'ptm.projects',
  defaultSort: { key: 'name', direction: 'asc' },
  emptyText: 'Проектів не знайдено.',
  // Render in batches and load more on scroll when the list grows large.
  pageSize: 20,
  columns,
}))

const formatDate = (iso: string): string => new Date(iso).toLocaleDateString('uk-UA')
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.cell-name {
  &__title {
    display: block;
    font-weight: 500;
    @include truncate;
  }

  &__desc {
    display: block;
    font-size: 12px;
    color: var(--color-text-muted);
    @include truncate;
  }
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: rgba(31, 39, 51, 0.1);
    color: var(--color-text);
  }
}
</style>
