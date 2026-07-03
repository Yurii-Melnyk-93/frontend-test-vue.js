<template>
  <div class="task-filters">
    <select v-model="assignee" aria-label="Фільтр за виконавцем">
      <option value="all">Усі виконавці</option>
      <option value="none">Без виконавця</option>
      <option v-for="member in TEAM_MEMBERS" :key="member" :value="member">{{ member }}</option>
    </select>
    <select v-model="status" aria-label="Фільтр за статусом">
      <option value="all">Усі статуси</option>
      <option v-for="option in statusOptions" :key="option" :value="option">
        {{ TASK_STATUS_LABELS[option] }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { TASK_STATUS_LABELS, TaskStatus } from '@/types/enums'
import { TEAM_MEMBERS } from '@/constants/team'

const assignee = defineModel<string | 'all'>('assignee', { required: true })
const status = defineModel<TaskStatus | 'all'>('status', { required: true })

const statusOptions = Object.values(TaskStatus)
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.task-filters {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;

  select {
    padding: 8px 12px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 14px;
    min-width: 160px;
    @include select-arrow;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
    }
  }
}
</style>
