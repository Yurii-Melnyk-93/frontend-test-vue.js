import type { TaskStatus } from './enums'

/** Task domain model. */
export interface Task {
  id: number
  projectId: number
  name: string
  assignee: string | null
  status: TaskStatus
  /** Due date as an ISO string (YYYY-MM-DD). */
  dueDate: string
  /** Global position within the project (order in the table and kanban). */
  order: number
  createdAt: string
}

/** Payload for creating a task. */
export interface TaskCreateDto {
  projectId: number
  name: string
  assignee: string | null
  status: TaskStatus
  dueDate: string
}

/** Payload for updating a task. */
export type TaskUpdateDto = Partial<Omit<Task, 'id' | 'projectId' | 'createdAt'>>
