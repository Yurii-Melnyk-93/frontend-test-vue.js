import { ProjectStatus, TaskStatus } from '@/types/enums'
import type { Project } from '@/types/project'
import type { Task } from '@/types/task'

/** Typed localStorage wrapper — the single access point to persistent data. */

const PROJECTS_KEY = 'ptm.projects'
const TASKS_KEY = 'ptm.tasks'
// Bump this whenever the seed data itself changes (e.g. re-translated),
// so previously-seeded localStorage gets replaced instead of left stale.
const SEED_VERSION_KEY = 'ptm.seedVersion'
const SEED_VERSION = '2'

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

/** Demo data for the first run (when localStorage is empty or the seed is outdated). */
function seed(): void {
  if (localStorage.getItem(PROJECTS_KEY) !== null && localStorage.getItem(SEED_VERSION_KEY) === SEED_VERSION) {
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
      name: 'Landing Page Redesign',
      description: 'Updating the home page and component system.',
      status: ProjectStatus.Active,
      createdAt: iso(12),
    },
    {
      id: 2,
      name: 'Mobile App',
      description: 'MVP of a mobile client built on top of the REST API.',
      status: ProjectStatus.Active,
      createdAt: iso(30),
    },
    {
      id: 3,
      name: 'Infrastructure Migration',
      description: 'Moving services into containers.',
      status: ProjectStatus.Archived,
      createdAt: iso(90),
    },
  ]

  const tasks: Task[] = [
    {
      id: 1,
      projectId: 1,
      name: 'Gather mockup requirements',
      assignee: 'Olena',
      status: TaskStatus.Done,
      dueDate: dateOnly(-3),
      order: 3,
      createdAt: iso(10),
    },
    {
      id: 2,
      projectId: 1,
      name: 'Build the hero section',
      assignee: 'Ihor',
      status: TaskStatus.InProgress,
      dueDate: dateOnly(2),
      order: 2,
      createdAt: iso(6),
    },
    {
      id: 3,
      projectId: 1,
      name: 'Set up analytics',
      assignee: null,
      status: TaskStatus.Todo,
      dueDate: dateOnly(5),
      order: 0,
      createdAt: iso(4),
    },
    {
      id: 4,
      projectId: 1,
      name: 'Run a code review',
      assignee: 'Olena',
      status: TaskStatus.Todo,
      dueDate: dateOnly(7),
      order: 1,
      createdAt: iso(2),
    },
    {
      id: 5,
      projectId: 2,
      name: 'Design navigation',
      assignee: 'Maria',
      status: TaskStatus.InProgress,
      dueDate: dateOnly(3),
      order: 1,
      createdAt: iso(8),
    },
    {
      id: 6,
      projectId: 2,
      name: 'Integrate authentication',
      assignee: 'Ihor',
      status: TaskStatus.Todo,
      dueDate: dateOnly(9),
      order: 0,
      createdAt: iso(5),
    },
  ]

  write(PROJECTS_KEY, projects)
  write(TASKS_KEY, tasks)
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
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
