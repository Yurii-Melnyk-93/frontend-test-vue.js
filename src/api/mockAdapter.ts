import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { storage } from './storage'
import { ApiError } from '@/types/api'
import type { Project, ProjectCreateDto, ProjectUpdateDto } from '@/types/project'
import type { Task, TaskCreateDto, TaskUpdateDto } from '@/types/task'
import { ProjectStatus } from '@/types/enums'

/**
 * Axios mock adapter: intercepts requests and reads/writes localStorage with a
 * 150–300ms delay — the app runs without a backend while keeping the Axios layer.
 */

function delay(): Promise<void> {
  const ms = 150 + Math.random() * 150
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function ok<T>(data: T, config: InternalAxiosRequestConfig, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config,
  }
}

function nextId(items: ReadonlyArray<{ id: number }>): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

function parseBody<T>(raw: unknown): T {
  if (typeof raw === 'string') {
    return JSON.parse(raw) as T
  }
  return raw as T
}

/** Next order (end of the project) for a new task. */
function nextOrderForProject(tasks: readonly Task[], projectId: number): number {
  const inProject = tasks.filter((t) => t.projectId === projectId)
  return inProject.reduce((max, t) => Math.max(max, t.order), -1) + 1
}

// Route handlers

function handleProjects(method: string, id: number | null, body: unknown): unknown {
  const projects = storage.getProjects()

  switch (method) {
    case 'get':
      return projects

    case 'post': {
      const dto = parseBody<ProjectCreateDto>(body)
      const project: Project = {
        id: nextId(projects),
        name: dto.name,
        description: dto.description ?? '',
        status: ProjectStatus.Active,
        createdAt: new Date().toISOString(),
      }
      storage.setProjects([...projects, project])
      return project
    }

    case 'put': {
      const index = projects.findIndex((p) => p.id === id)
      if (index === -1) {
        throw new ApiError('Проект не знайдено', 404)
      }
      const patch = parseBody<ProjectUpdateDto>(body)
      const updated: Project = { ...projects[index], ...patch, id: projects[index].id }
      const copy = [...projects]
      copy[index] = updated
      storage.setProjects(copy)
      return updated
    }

    case 'delete': {
      const exists = projects.some((p) => p.id === id)
      if (!exists) {
        throw new ApiError('Проект не знайдено', 404)
      }
      storage.setProjects(projects.filter((p) => p.id !== id))
      // Cascade-delete the project's tasks.
      storage.setTasks(storage.getTasks().filter((t) => t.projectId !== id))
      return { id }
    }

    default:
      throw new ApiError(`Метод ${method} не підтримується`, 405)
  }
}

function handleTasks(
  method: string,
  id: number | null,
  params: Record<string, unknown> | undefined,
  body: unknown,
): unknown {
  const tasks = storage.getTasks()

  switch (method) {
    case 'get': {
      const projectIdParam = params?.projectId
      if (projectIdParam === undefined || projectIdParam === null) {
        return tasks
      }
      const projectId = Number(projectIdParam)
      return tasks.filter((t) => t.projectId === projectId)
    }

    case 'post': {
      const dto = parseBody<TaskCreateDto>(body)
      const task: Task = {
        id: nextId(tasks),
        projectId: dto.projectId,
        name: dto.name,
        assignee: dto.assignee,
        status: dto.status,
        dueDate: dto.dueDate,
        order: nextOrderForProject(tasks, dto.projectId),
        createdAt: new Date().toISOString(),
      }
      storage.setTasks([...tasks, task])
      return task
    }

    case 'put': {
      const index = tasks.findIndex((t) => t.id === id)
      if (index === -1) {
        throw new ApiError('Завдання не знайдено', 404)
      }
      const patch = parseBody<TaskUpdateDto>(body)
      const updated: Task = { ...tasks[index], ...patch, id: tasks[index].id }
      const copy = [...tasks]
      copy[index] = updated
      storage.setTasks(copy)
      return updated
    }

    case 'delete': {
      const exists = tasks.some((t) => t.id === id)
      if (!exists) {
        throw new ApiError('Завдання не знайдено', 404)
      }
      storage.setTasks(tasks.filter((t) => t.id !== id))
      return { id }
    }

    default:
      throw new ApiError(`Метод ${method} не підтримується`, 405)
  }
}

/** Parses a path like /projects or /projects/12 into resource and id. */
function parsePath(url: string): { resource: string; id: number | null } {
  const path = url.split('?')[0].replace(/^\/+|\/+$/g, '')
  const [resource, rawId] = path.split('/')
  return {
    resource,
    id: rawId !== undefined ? Number(rawId) : null,
  }
}

export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  storage.ensureSeeded()
  await delay()

  const method = (config.method ?? 'get').toLowerCase()
  const url = config.url ?? ''
  const { resource, id } = parsePath(url)

  const params = config.params as Record<string, unknown> | undefined

  switch (resource) {
    case 'projects':
      return ok(handleProjects(method, id, config.data), config)
    case 'tasks':
      return ok(handleTasks(method, id, params, config.data), config)
    default:
      throw new ApiError(`Невідомий ресурс: ${resource}`, 404)
  }
}
