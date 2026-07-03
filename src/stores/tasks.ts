import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { tasksApi } from '@/api/tasks.api'
import { ApiError } from '@/types/api'
import { TaskStatus } from '@/types/enums'
import type { Task, TaskCreateDto, TaskUpdateDto } from '@/types/task'

/**
 * Tasks store — shared data source for the table and kanban.
 * `order` is a global position within the project: the table reorders freely,
 * while the kanban shows tasks of its status in that same order.
 */
export const useTasksStore = defineStore('tasks', () => {
  const items = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters

  const byProject = computed(() => {
    return (projectId: number): Task[] => items.value.filter((t) => t.projectId === projectId)
  })

  const countByProject = computed(() => {
    return (projectId: number): number =>
      items.value.reduce((n, t) => (t.projectId === projectId ? n + 1 : n), 0)
  })

  const byStatus = computed(() => {
    return (projectId: number, status: TaskStatus): Task[] =>
      items.value
        .filter((t) => t.projectId === projectId && t.status === status)
        .sort((a, b) => a.order - b.order || a.id - b.id)
  })

  // Helpers

  /** Persists the listed tasks (order/status) through the API layer. */
  async function persist(ids: Iterable<number>): Promise<void> {
    const unique = new Set(ids)
    await Promise.all(
      [...unique].map((id) => {
        const task = items.value.find((t) => t.id === id)
        if (task === undefined) {
          return Promise.resolve()
        }
        const patch: TaskUpdateDto = { status: task.status, order: task.order }
        return tasksApi.update(id, patch)
      }),
    )
  }

  // Actions

  async function fetchAll(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      items.value = await tasksApi.getAll()
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не вдалося завантажити завдання'
    } finally {
      loading.value = false
    }
  }

  async function fetchByProject(projectId: number): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const list = await tasksApi.getByProject(projectId)
      // Update only this project's tasks.
      items.value = [...items.value.filter((t) => t.projectId !== projectId), ...list]
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не вдалося завантажити завдання'
    } finally {
      loading.value = false
    }
  }

  async function createTask(dto: TaskCreateDto): Promise<Task> {
    const created = await tasksApi.create(dto)
    items.value = [...items.value, created]
    return created
  }

  async function updateTask(id: number, dto: TaskUpdateDto): Promise<Task> {
    const updated = await tasksApi.update(id, dto)
    items.value = items.value.map((t) => (t.id === id ? updated : t))
    return updated
  }

  async function deleteTask(id: number): Promise<void> {
    await tasksApi.remove(id)
    items.value = items.value.filter((t) => t.id !== id)
  }

  /** Project tasks in global order (id as tiebreak). */
  function projectOrdered(projectId: number): Task[] {
    return items.value
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => a.order - b.order || a.id - b.id)
  }

  /** Applies a new order and persists the changed tasks. */
  async function commitOrder(projectId: number, orderedList: Task[]): Promise<void> {
    const orderMap = new Map(orderedList.map((t, i) => [t.id, i]))
    items.value = items.value.map((t) => {
      const next = orderMap.get(t.id)
      return next !== undefined && next !== t.order ? { ...t, order: next } : t
    })
    await persistWithRollback([...orderMap.keys()], projectId)
  }

  /** Reorder within a single status (kanban column); the rest stays put. */
  async function reorderWithinStatus(
    projectId: number,
    status: TaskStatus,
    orderedIds: number[],
  ): Promise<void> {
    const all = projectOrdered(projectId)
    const newSeq = orderedIds
      .map((id) => all.find((t) => t.id === id))
      .filter((t): t is Task => t !== undefined)
    let cursor = 0
    const reordered = all.map((t) => (t.status === status ? newSeq[cursor++] : t))
    await commitOrder(projectId, reordered)
  }

  /** Moves a task to another status at position `newIndex` of the target column. */
  async function moveTaskToStatus(
    taskId: number,
    newStatus: TaskStatus,
    newIndex: number,
  ): Promise<void> {
    const task = items.value.find((t) => t.id === taskId)
    if (task === undefined) {
      return
    }
    const { projectId } = task
    const rest = projectOrdered(projectId).filter((t) => t.id !== taskId)

    // Positions of target-status tasks among the rest.
    const targetPositions = rest.reduce<number[]>((acc, t, i) => {
      if (t.status === newStatus) {
        acc.push(i)
      }
      return acc
    }, [])
    const insertPos =
      newIndex >= targetPositions.length ? rest.length : targetPositions[newIndex]

    const movedTask: Task = { ...task, status: newStatus }
    const newList = [...rest.slice(0, insertPos), movedTask, ...rest.slice(insertPos)]
    const orderMap = new Map(newList.map((t, i) => [t.id, i]))

    items.value = items.value.map((t) => {
      if (t.id === taskId) {
        return { ...t, status: newStatus, order: orderMap.get(taskId) ?? t.order }
      }
      const next = orderMap.get(t.id)
      return next !== undefined && next !== t.order ? { ...t, order: next } : t
    })
    await persistWithRollback([...orderMap.keys()], projectId)
  }

  /** Manual table row order. */
  async function applyManualOrder(projectId: number, orderedTasks: Task[]): Promise<void> {
    await commitOrder(projectId, orderedTasks)
  }

  /** Persist with rollback (refetch) on error. */
  async function persistWithRollback(ids: Iterable<number>, projectId: number): Promise<void> {
    try {
      await persist(ids)
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Не вдалося зберегти порядок'
      await fetchByProject(projectId)
    }
  }

  return {
    items,
    loading,
    error,
    byProject,
    countByProject,
    byStatus,
    fetchAll,
    fetchByProject,
    createTask,
    updateTask,
    deleteTask,
    reorderWithinStatus,
    moveTaskToStatus,
    applyManualOrder,
  }
})
