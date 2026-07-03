<template>
  <div class="kanban">
    <KanbanColumn
      v-for="status in KANBAN_COLUMNS"
      :key="status"
      :project-id="props.projectId"
      :status="status"
      :tasks="store.byStatus(props.projectId, status)"
      @edit="emit('edit', $event)"
      @remove="emit('remove', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import KanbanColumn from '@/components/tasks/KanbanColumn.vue'
import { KANBAN_COLUMNS } from '@/types/enums'
import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/types/task'

const props = defineProps<{ projectId: number }>()
const emit = defineEmits<{ edit: [task: Task]; remove: [id: number] }>()

const store = useTasksStore()
</script>

<style scoped lang="scss">
.kanban {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  align-items: start;
}

@media (max-width: 800px) {
  .kanban {
    grid-template-columns: 1fr;
  }
}
</style>
