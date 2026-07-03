import { useTasksStore } from '@/stores/tasks'
import type { TaskStatus } from '@/types/enums'
import type { Task } from '@/types/task'

/** Events emitted by vuedraggable via `@change`. */
export interface DraggableChangeEvent {
  moved?: { element: Task; oldIndex: number; newIndex: number }
  added?: { element: Task; newIndex: number }
  removed?: { element: Task; oldIndex: number }
}

export interface UseTaskDragReturn {
  onKanbanChange: (projectId: number, status: TaskStatus, event: DraggableChangeEvent) => void
  applyTableOrder: (projectId: number, orderedTasks: Task[]) => void
}

/**
 * DnD hook: translates vuedraggable events into store actions (status/order
 * changes), keeping the table and kanban "thin".
 */
export function useTaskDrag(): UseTaskDragReturn {
  const store = useTasksStore()

  function onKanbanChange(
    projectId: number,
    status: TaskStatus,
    event: DraggableChangeEvent,
  ): void {
    if (event.added !== undefined) {
      void store.moveTaskToStatus(event.added.element.id, status, event.added.newIndex)
      return
    }
    if (event.moved !== undefined) {
      const ids = store.byStatus(projectId, status).map((t) => t.id)
      const [moved] = ids.splice(event.moved.oldIndex, 1)
      ids.splice(event.moved.newIndex, 0, moved)
      void store.reorderWithinStatus(projectId, status, ids)
    }
    // Ignore `removed` — the move is completed by the target column's `added`.
  }

  function applyTableOrder(projectId: number, orderedTasks: Task[]): void {
    void store.applyManualOrder(projectId, orderedTasks)
  }

  return { onKanbanChange, applyTableOrder }
}
