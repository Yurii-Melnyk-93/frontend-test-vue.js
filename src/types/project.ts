import type { ProjectStatus } from './enums'

/** Project domain model. */
export interface Project {
  id: number
  name: string
  description: string
  status: ProjectStatus
  /** Creation date as an ISO string. */
  createdAt: string
}

/** Payload for creating a project. */
export interface ProjectCreateDto {
  name: string
  description: string
}

/** Payload for updating a project. */
export type ProjectUpdateDto = Partial<Omit<Project, 'id'>>
