<template>
  <section class="projects">
    <div class="projects__head">
      <div>
        <h1 class="projects__title">Проекти</h1>
        <p class="projects__subtitle">Керуйте проектами та їхніми завданнями.</p>
      </div>
      <BaseButton variant="primary" @click="openCreate">+ Додати проект</BaseButton>
    </div>

    <div class="projects__layout">
      <div class="projects__main">
        <ProjectFilters v-model:search="search" v-model:status="statusFilter" />

        <p v-if="error" class="projects__error">{{ error }}</p>
        <p v-else-if="loading" class="projects__loading">Завантаження…</p>
        <ProjectTable
          v-else
          :projects="filteredProjects"
          @select="goToProject"
          @edit="openEdit"
          @remove="requestDelete"
        />
      </div>

      <aside class="projects__aside">
        <TasksStatusChart />
      </aside>
    </div>

    <ProjectFormModal :open="modalOpen" :project="editingProject" @close="modalOpen = false" />

    <BaseModal
      :open="projectToDelete !== null"
      title="Видалити проект?"
      @close="projectToDelete = null"
    >
      <p class="confirm-text">
        Видалити проект «{{ projectToDelete?.name }}» разом з усіма його завданнями? Дію не можна
        скасувати.
      </p>
      <div class="confirm-actions">
        <BaseButton variant="secondary" @click="projectToDelete = null">Скасувати</BaseButton>
        <BaseButton variant="danger" @click="confirmDelete">Видалити</BaseButton>
      </div>
    </BaseModal>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ProjectFilters from '@/components/projects/ProjectFilters.vue'
import ProjectTable from '@/components/projects/ProjectTable.vue'
import ProjectFormModal from '@/components/projects/ProjectFormModal.vue'
import TasksStatusChart from '@/components/projects/TasksStatusChart.vue'
import { useProjectsStore } from '@/stores/projects'
import { useTasksStore } from '@/stores/tasks'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useToast } from '@/composables/useToast'
import { ApiError } from '@/types/api'
import type { ProjectStatus } from '@/types/enums'
import type { Project } from '@/types/project'

const router = useRouter()
const projectsStore = useProjectsStore()
const tasksStore = useTasksStore()
const toast = useToast()
const { items: projects, loading, error } = storeToRefs(projectsStore)

// Persist filters (bonus).
const search = useLocalStorage<string>('ptm.projects.search', '')
const statusFilter = useLocalStorage<ProjectStatus | 'all'>('ptm.projects.statusFilter', 'all')

const modalOpen = ref(false)
const editingProject = ref<Project | null>(null)
const projectToDelete = ref<Project | null>(null)

const filteredProjects = computed(() => {
  const query = search.value.trim().toLowerCase()
  return projects.value.filter((p) => {
    const matchesName = query === '' || p.name.toLowerCase().includes(query)
    const matchesStatus = statusFilter.value === 'all' || p.status === statusFilter.value
    return matchesName && matchesStatus
  })
})

function goToProject(id: number): void {
  void router.push({ name: 'project', params: { id } })
}

function openCreate(): void {
  editingProject.value = null
  modalOpen.value = true
}

function openEdit(project: Project): void {
  editingProject.value = project
  modalOpen.value = true
}

function requestDelete(id: number): void {
  projectToDelete.value = projects.value.find((p) => p.id === id) ?? null
}

async function confirmDelete(): Promise<void> {
  const project = projectToDelete.value
  if (project === null) {
    return
  }
  try {
    await projectsStore.deleteProject(project.id)
    // The mock cascade-clears the tasks — resync their store.
    await tasksStore.fetchAll()
    toast.success('Проект видалено')
  } catch (e) {
    toast.error(e instanceof ApiError ? e.message : 'Не вдалося видалити проект')
  } finally {
    projectToDelete.value = null
  }
}

onMounted(() => {
  void projectsStore.fetchAll()
  // All tasks — for the counters and the chart.
  void tasksStore.fetchAll()
})
</script>

<style scoped lang="scss">
.projects {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  &__title {
    margin: 0;
    font-size: 24px;
  }

  &__subtitle {
    margin: 4px 0 0;
    color: var(--color-text-muted);
  }

  &__layout {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: var(--space-5);
    align-items: start;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    min-width: 0;
  }

  &__error {
    color: var(--color-danger);
  }

  &__loading {
    color: var(--color-text-muted);
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

@media (max-width: 900px) {
  .projects__layout {
    grid-template-columns: 1fr;
  }
}
</style>
