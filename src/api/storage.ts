import { ProjectStatus, TaskStatus } from '@/types/enums'
import type { Project } from '@/types/project'
import type { Task } from '@/types/task'

/** Typed localStorage wrapper — the single access point to persistent data. */

const PROJECTS_KEY = 'ptm.projects'
const TASKS_KEY = 'ptm.tasks'

function read<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (raw === null) {
    return fallback
  }
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/** Demo data for the first run (when localStorage is empty). */
function seed(): void {
  if (localStorage.getItem(PROJECTS_KEY) !== null) {
    return
  }

  const now = new Date()
  const iso = (daysAgo: number): string =>
    new Date(now.getTime() - daysAgo * 86_400_000).toISOString()
  const dateOnly = (daysFromNow: number): string =>
    new Date(now.getTime() + daysFromNow * 86_400_000).toISOString().slice(0, 10)

  const projects: Project[] = [
    {
      id: 1,
      name: 'Редизайн лендінгу',
      description: 'Оновлення головної сторінки та системи компонентів.',
      status: ProjectStatus.Active,
      createdAt: iso(12),
    },
    {
      id: 2,
      name: 'Мобільний застосунок',
      description: 'MVP мобільного клієнта на базі REST API.',
      status: ProjectStatus.Active,
      createdAt: iso(30),
    },
    {
      id: 3,
      name: 'Міграція інфраструктури',
      description: 'Перенесення сервісів у контейнери.',
      status: ProjectStatus.Archived,
      createdAt: iso(90),
    },
  ]

  const tasks: Task[] = [
    {
      id: 1,
      projectId: 1,
      name: 'Зібрати вимоги до макетів',
      assignee: 'Олена',
      status: TaskStatus.Done,
      dueDate: dateOnly(-3),
      order: 3,
      createdAt: iso(10),
    },
    {
      id: 2,
      projectId: 1,
      name: 'Зверстати hero-секцію',
      assignee: 'Ігор',
      status: TaskStatus.InProgress,
      dueDate: dateOnly(2),
      order: 2,
      createdAt: iso(6),
    },
    {
      id: 3,
      projectId: 1,
      name: 'Налаштувати аналітику',
      assignee: null,
      status: TaskStatus.Todo,
      dueDate: dateOnly(5),
      order: 0,
      createdAt: iso(4),
    },
    {
      id: 4,
      projectId: 1,
      name: 'Провести код-рев’ю',
      assignee: 'Олена',
      status: TaskStatus.Todo,
      dueDate: dateOnly(7),
      order: 1,
      createdAt: iso(2),
    },
    {
      id: 5,
      projectId: 2,
      name: 'Спроєктувати навігацію',
      assignee: 'Марія',
      status: TaskStatus.InProgress,
      dueDate: dateOnly(3),
      order: 1,
      createdAt: iso(8),
    },
    {
      id: 6,
      projectId: 2,
      name: 'Інтегрувати авторизацію',
      assignee: 'Ігор',
      status: TaskStatus.Todo,
      dueDate: dateOnly(9),
      order: 0,
      createdAt: iso(5),
    },
  ]

  write(PROJECTS_KEY, projects)
  write(TASKS_KEY, tasks)
}

export const storage = {
  ensureSeeded(): void {
    seed()
  },
  getProjects(): Project[] {
    return read<Project[]>(PROJECTS_KEY, [])
  },
  setProjects(projects: Project[]): void {
    write(PROJECTS_KEY, projects)
  },
  getTasks(): Task[] {
    return read<Task[]>(TASKS_KEY, [])
  },
  setTasks(tasks: Task[]): void {
    write(TASKS_KEY, tasks)
  },
}
