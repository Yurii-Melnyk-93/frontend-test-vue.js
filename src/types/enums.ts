/** Project statuses. */
export enum ProjectStatus {
  Active = 'active',
  Archived = 'archived',
}

/** Task statuses (also the kanban columns). */
export enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
}

/** Project status labels. */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Active]: 'Активний',
  [ProjectStatus.Archived]: 'Архівований',
}

/** Task status labels. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: 'To Do',
  [TaskStatus.InProgress]: 'In Progress',
  [TaskStatus.Done]: 'Done',
}

/** Kanban column order. */
export const KANBAN_COLUMNS: readonly TaskStatus[] = [
  TaskStatus.Todo,
  TaskStatus.InProgress,
  TaskStatus.Done,
] as const
