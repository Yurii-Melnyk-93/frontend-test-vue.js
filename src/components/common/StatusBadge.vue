<template>
  <span
    class="badge"
    :class="isTaskStatus ? `badge--task` : `badge--project`"
    :style="isTaskStatus ? { '--dot': `var(--status-${status})` } : undefined"
    :data-status="status"
  >
    <span v-if="isTaskStatus" class="badge__dot" />
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  PROJECT_STATUS_LABELS,
  ProjectStatus,
  TASK_STATUS_LABELS,
  TaskStatus,
} from '@/types/enums'

const props = defineProps<{
  status: ProjectStatus | TaskStatus
}>()

const label = computed<string>(() => {
  if (props.status in TASK_STATUS_LABELS) {
    return TASK_STATUS_LABELS[props.status as TaskStatus]
  }
  return PROJECT_STATUS_LABELS[props.status as ProjectStatus]
})

const isTaskStatus = computed<boolean>(() =>
  (Object.values(TaskStatus) as string[]).includes(props.status),
)
</script>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot);
  }

  &--task {
    background: var(--color-bg);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }

  &--project {
    &[data-status='active'] {
      background: rgba(47, 158, 99, 0.12);
      color: var(--color-success);
    }
    &[data-status='archived'] {
      background: rgba(107, 116, 128, 0.14);
      color: var(--color-text-muted);
    }
  }
}
</style>
