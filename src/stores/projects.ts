import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { projectsApi } from '@/api/projects.api'
import { ApiError } from '@/types/api'
import type { Project, ProjectCreateDto, ProjectUpdateDto } from '@/types/project'

/**
 * Projects store (CRUD only). Task counts are computed by the tasks store.
 * Persistence goes through the API layer (the mock adapter writes to localStorage).
 */
export const useProjectsStore = defineStore('projects', () => {
  const items = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getById = computed(() => {
    return (id: number): Project | undefined => items.value.find((p) => p.id === id)
  })

  async function fetchAll(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      items.value = await projectsApi.getAll()
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не вдалося завантажити проекти'
    } finally {
      loading.value = false
    }
  }

  async function createProject(dto: ProjectCreateDto): Promise<Project> {
    const created = await projectsApi.create(dto)
    items.value = [...items.value, created]
    return created
  }

  async function updateProject(id: number, dto: ProjectUpdateDto): Promise<Project> {
    const updated = await projectsApi.update(id, dto)
    items.value = items.value.map((p) => (p.id === id ? updated : p))
    return updated
  }

  async function deleteProject(id: number): Promise<void> {
    await projectsApi.remove(id)
    items.value = items.value.filter((p) => p.id !== id)
  }

  return {
    items,
    loading,
    error,
    getById,
    fetchAll,
    createProject,
    updateProject,
    deleteProject,
  }
})
