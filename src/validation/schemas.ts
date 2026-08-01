import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { TaskStatus } from '@/types/enums'

/** Compares a date (YYYY-MM-DD) with today, ignoring the time part. */
function isNotPast(dateStr: string): boolean {
  if (dateStr === '') {
    return false
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(`${dateStr}T00:00:00`)
  return date.getTime() >= today.getTime()
}

/** Project form schema: name 2–100, description optional. */
export const projectFormSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, 'This field is required')
      .min(2, '2 to 100 characters')
      .max(100, '2 to 100 characters'),
    description: z.string().max(500, 'up to 500 characters').default(''),
  }),
)

/** Task form schema: name 3–120, status required, date >= today. */
export const taskFormSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, 'This field is required')
      .min(3, '3 to 120 characters')
      .max(120, '3 to 120 characters'),
    status: z.nativeEnum(TaskStatus, {
      errorMap: () => ({ message: 'Select a status' }),
    }),
    dueDate: z
      .string()
      .min(1, 'This field is required')
      .refine(isNotPast, { message: 'The date cannot be in the past' }),
    assignee: z.string().default(''),
  }),
)

/** Project form value types. */
export interface ProjectFormValues {
  name: string
  description: string
}

/** Task form value types. */
export interface TaskFormValues {
  name: string
  status: TaskStatus
  dueDate: string
  assignee: string
}
