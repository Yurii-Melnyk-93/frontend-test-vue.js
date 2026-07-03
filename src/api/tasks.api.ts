import { http, toApiError } from './http'
import type { Task, TaskCreateDto, TaskUpdateDto } from '@/types/task'

/** Tasks service layer. Error handling lives here only; an `ApiError` is thrown outward. */
export const tasksApi = {
  async getByProject(projectId: number): Promise<Task[]> {
    try {
      const { data } = await http.get<Task[]>('/tasks', { params: { projectId } })
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async getAll(): Promise<Task[]> {
    try {
      const { data } = await http.get<Task[]>('/tasks')
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async create(dto: TaskCreateDto): Promise<Task> {
    try {
      const { data } = await http.post<Task>('/tasks', dto)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async update(id: number, dto: TaskUpdateDto): Promise<Task> {
    try {
      const { data } = await http.put<Task>(`/tasks/${id}`, dto)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await http.delete(`/tasks/${id}`)
    } catch (error) {
      throw toApiError(error)
    }
  },
}
