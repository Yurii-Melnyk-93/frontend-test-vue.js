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
      .min(1, "Поле обов'язкове")
      .min(2, 'від 2 до 100 символів')
      .max(100, 'від 2 до 100 символів'),
    description: z.string().max(500, 'до 500 символів').default(''),
  }),
)

/** Task form schema: name 3–120, status required, date >= today. */
export const taskFormSchema = toTypedSchema(
  z.object({
    name: z
      .string()
      .min(1, "Поле обов'язкове")
      .min(3, 'від 3 до 120 символів')
      .max(120, 'від 3 до 120 символів'),
    status: z.nativeEnum(TaskStatus, {
      errorMap: () => ({ message: 'Оберіть статус' }),
    }),
    dueDate: z
      .string()
      .min(1, "Поле обов'язкове")
      .refine(isNotPast, { message: 'Дата не може бути в минулому' }),
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
