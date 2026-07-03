<template>
  <section class="column" :data-status="status">
    <header class="column__head">
      <span class="column__dot" :style="{ background: `var(--status-${status})` }" />
      <h3 class="column__title">{{ TASK_STATUS_LABELS[status] }}</h3>
      <span class="column__count">{{ tasks.length }}</span>
    </header>

    <draggable
      v-model="localTasks"
      class="column__list"
      group="tasks"
      item-key="id"
      :animation="180"
      ghost-class="card--ghost"
      @change="onChange"
    >
      <template #item="{ element }">
        <TaskCard :task="element" @edit="emit('edit', $event)" @remove="emit('remove', $event)" />
      </template>
    </draggable>

    <p v-if="tasks.length === 0" class="column__empty">Немає завдань</p>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import TaskCard from '@/components/tasks/TaskCard.vue'
import { TASK_STATUS_LABELS, type TaskStatus } from '@/types/enums'
import { useTaskDrag, type DraggableChangeEvent } from '@/composables/useTaskDrag'
import type { Task } from '@/types/task'

const props = defineProps<{
  projectId: number
  status: TaskStatus
  tasks: Task[]
}>()
const emit = defineEmits<{ edit: [task: Task]; remove: [id: number] }>()

const drag = useTaskDrag()

// Local copy: vuedraggable mutates it during DnD, @change forwards to the store,
// and a watch resyncs the copy after the store updates.
const localTasks = ref<Task[]>([...props.tasks])
watch(
  () => props.tasks,
  (next) => {
    localTasks.value = [...next]
  },
)

function onChange(event: DraggableChangeEvent): void {
  drag.onKanbanChange(props.projectId, props.status, event)
}
</script>

<style scoped lang="scss">
.column {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;

  &__head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
    padding: 0 var(--space-1);
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  &__title {
    margin: 0;
    font-size: 14px;
    flex: 1;
  }

  &__count {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-muted);
    background: var(--color-surface);
    border-radius: 999px;
    padding: 1px 8px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    // Drop zone for an empty column; no flex-grow — equal bottom padding
    // across all columns.
    min-height: 60px;
  }

  &__empty {
    text-align: center;
    color: var(--color-text-muted);
    font-size: 13px;
    padding: var(--space-4) 0;
  }
}

:deep(.card--ghost) {
  opacity: 0.5;
  border: 1px dashed var(--color-primary);
}
</style>
