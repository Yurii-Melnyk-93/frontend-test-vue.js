import { onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * Local writable ref that mirrors a target ref for instant UI feedback, but only
 * writes back to the target after `delay` ms of inactivity (debounce).
 * Handy for search inputs so filtering doesn't run on every keystroke.
 */
export function useDebouncedModel<T>(target: Ref<T>, delay = 300): Ref<T> {
  const local = ref(target.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  // Typing updates the local value immediately, the target after the pause.
  watch(local, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      target.value = value
    }, delay)
  })

  // Keep the field in sync when the target changes elsewhere (persisted value, reset).
  watch(target, (value) => {
    if (value !== local.value) {
      local.value = value
    }
  })

  onScopeDispose(() => clearTimeout(timer))

  return local
}
