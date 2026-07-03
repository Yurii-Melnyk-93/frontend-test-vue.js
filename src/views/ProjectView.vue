<template>
  <section class="project">
    <RouterLink to="/" class="project__back">← Усі проекти</RouterLink>

    <template v-if="project">
      <div class="project__head">
        <div>
          <div class="project__title-row">
            <h1 class="project__title">{{ project.name }}</h1>
            <StatusBadge :status="project.status" />
          </div>
          <p v-if="project.description" class="project__desc">{{ project.description }}</p>
        </div>
        <BaseButton variant="primary" @click="openCreate">+ Додати завдання</BaseButton>
      </div>

      <div class="project__toolbar">
        <div class="switch" role="tablist" aria-label="Режим відображення">
          <button
            class="switch__btn"
            :class="{ 'switch__btn--active': viewMode === 'table' }"
            role="tab"
            @click="viewMode = 'table'"
          >
            Таблиця
          </button>
          <button
            class="switch__btn"
            :class="{ 'switch__btn--active': viewMode === 'kanban' }"
            role="tab"
            @click="viewMode = 'kanban'"
          >
            Канбан
          </button>
        </div>

        <TaskFilters
          v-if="viewMode === 'table'"
          v-model:assignee="assigneeFilter"
          v-model:status="statusFilter"
        />
      </div>

      <p v-if="tasksStore.error" class="project__error">{{ tasksStore.error }}</p>

      <Transition name="fade-mode" mode="out-in">
        <TaskTable
          v-if="viewMode === 'table'"
          key="table"
          :tasks="filteredTasks"
          :project-id="props.projectId"
          @edit="openEdit"
          @remove="requestDelete"
        />
        <TaskKanban
          v-else
          key="kanban"
          :project-id="props.projectId"
          @edit="openEdit"
          @remove="requestDelete"
        />
      </Transition>
    </template>

    <p v-else-if="!projectsStore.loading" class="project__missing">Проект не знайдено.</p>

    <TaskFormModal
      :open="modalOpen"
      :project-id="props.projectId"
      :task="editingTask"
      @close="modalOpen = false"
    />

    <BaseModal
      :open="taskToDelete !== null"
      title="Видалити завдання?"
      @close="taskToDelete = null"
    >
      <p class="confirm-text">
        Ви впевнені, що хочете видалити завдання «{{ taskToDelete?.name }}»? Дію не можна скасувати.
      </p>
      <div class="confirm-actions">
        <BaseButton variant="secondary" @click="taskToDelete = null">Скасувати</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">Видалити</BaseButton>
      </div>
    </BaseModal>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import TaskFilters from '@/components/tasks/TaskFilters.vue'
import TaskTable from '@/components/tasks/TaskTable.vue'
import TaskKanban from '@/components/tasks/TaskKanban.vue'
import TaskFormModal from '@/components/tasks/TaskFormModal.vue'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useToast } from '@/composables/useToast'
import { ApiError } from '@/types/api'
import type { TaskStatus } from '@/types/enums'
import type { Task } from '@/types/task'

const props = defineProps<{ projectId: number }>()

const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const toast = useToast()

type ViewMode = 'table' | 'kanban'
const viewMode = useLocalStorage<ViewMode>('ptm.viewMode', 'table')

// Persist filters (bonus), but scoped to a single project.
const assigneeFilter = useLocalStorage<string | 'all'>('ptm.tasks.assigneeFilter', 'all')
const statusFilter = useLocalStorage<TaskStatus | 'all'>('ptm.tasks.statusFilter', 'all')
// Which project the persisted filters belong to — lets us reset on project switch
// while still surviving a reload of the same project.
const filteredProjectId = useLocalStorage<number | null>('ptm.tasks.filterProjectId', null)

const modalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const taskToDelete = ref<Task | null>(null)

const project = computed(() => projectsStore.getById(props.projectId))

const filteredTasks = computed<Task[]>(() =>
  tasksStore.byProject(props.projectId).filter((t) => {
    const a = assigneeFilter.value
    const matchAssignee =
      a === 'all' || (a === 'none' ? t.assignee === null : t.assignee === a)
    const matchStatus = statusFilter.value === 'all' || t.status === statusFilter.value
    return matchAssignee && matchStatus
  }),
)

function openCreate(): void {
  editingTask.value = null
  modalOpen.value = true
}

function openEdit(task: Task): void {
  editingTask.value = task
  modalOpen.value = true
}

function requestDelete(id: number): void {
  taskToDelete.value = tasksStore.byProject(props.projectId).find((t) => t.id === id) ?? null
}

async function confirmDelete(): Promise<void> {
  const task = taskToDelete.value
  if (task === null) {
    return
  }
  try {
    await tasksStore.deleteTask(task.id)
    toast.success('Завдання видалено')
  } catch (e) {
    toast.error(e instanceof ApiError ? e.message : 'Не вдалося видалити завдання')
  } finally {
    taskToDelete.value = null
  }
}

// Runs on mount (fresh view per project) and on in-app `:id` changes (back/forward
// reuses the instance). Resets filters whenever the project differs from the one
// they were applied to, then loads that project's tasks.
watch(
  () => props.projectId,
  async (id) => {
    if (filteredProjectId.value !== id) {
      assigneeFilter.value = 'all'
      statusFilter.value = 'all'
      filteredProjectId.value = id
    }
    await tasksStore.fetchByProject(id)
  },
  { immediate: true },
)

onMounted(async () => {
  if (projectsStore.items.length === 0) {
    await projectsStore.fetchAll()
  }
})
</script>

<style scoped lang="scss">
.project {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  &__back {
    // Only the text is clickable, not the whole row.
    align-self: flex-start;
    color: var(--color-text-muted);
    font-size: 13px;
    &:hover {
      color: var(--color-primary);
    }
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  &__title-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  &__title {
    margin: 0;
    font-size: 22px;
  }

  &__desc {
    margin: 6px 0 0;
    color: var(--color-text-muted);
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  &__error {
    color: var(--color-danger);
  }

  &__missing {
    color: var(--color-text-muted);
  }
}

.switch {
  display: inline-flex;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 3px;

  &__btn {
    border: none;
    background: transparent;
    padding: 6px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-muted);
    transition: all 0.15s ease;

    &--active {
      background: var(--color-primary);
      color: #fff;
    }
  }
}

.confirm-text {
  margin: 0 0 var(--space-5);
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.fade-mode-enter-active,
.fade-mode-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.fade-mode-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-mode-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
