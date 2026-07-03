import { http, toApiError } from './http'
import type { Project, ProjectCreateDto, ProjectUpdateDto } from '@/types/project'

/** Projects service layer. Error handling lives here only; an `ApiError` is thrown outward. */
export const projectsApi = {
  async getAll(): Promise<Project[]> {
    try {
      const { data } = await http.get<Project[]>('/projects')
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async create(dto: ProjectCreateDto): Promise<Project> {
    try {
      const { data } = await http.post<Project>('/projects', dto)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async update(id: number, dto: ProjectUpdateDto): Promise<Project> {
    try {
      const { data } = await http.put<Project>(`/projects/${id}`, dto)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await http.delete(`/projects/${id}`)
    } catch (error) {
      throw toApiError(error)
    }
  },
}
