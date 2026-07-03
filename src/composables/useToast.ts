import { readonly, ref } from 'vue'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  kind: ToastKind
}

/** Global toast stack (module-level singleton). */
const toasts = ref<Toast[]>([])
let seq = 0

function push(message: string, kind: ToastKind, timeout = 3000): void {
  const id = ++seq
  toasts.value = [...toasts.value, { id, message, kind }]
  window.setTimeout(() => dismiss(id), timeout)
}

function dismiss(id: number): void {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    success: (message: string) => push(message, 'success'),
    error: (message: string) => push(message, 'error'),
    info: (message: string) => push(message, 'info'),
    dismiss,
  }
}
