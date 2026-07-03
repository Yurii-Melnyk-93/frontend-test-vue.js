import { ref, type Ref } from 'vue'

const MIN_WIDTH = 90

export interface UseColumnResizeReturn<K extends string> {
  widths: Ref<Record<K, number>>
  startResize: (key: K, event: MouseEvent) => void
  widthStyle: (key: K) => { width: string }
}

/**
 * Column resize hook via dragging the header divider.
 * Widths can be held externally (e.g. `useLocalStorage`) for persistence.
 */
export function useColumnResize<K extends string>(
  defaults: Record<K, number>,
  externalWidths?: Ref<Record<K, number>>,
): UseColumnResizeReturn<K> {
  const widths: Ref<Record<K, number>> =
    externalWidths ?? (ref({ ...defaults }) as Ref<Record<K, number>>)

  // Backfill missing keys if the persisted state is stale.
  for (const key of Object.keys(defaults) as K[]) {
    if (widths.value[key] === undefined) {
      widths.value = { ...widths.value, [key]: defaults[key] }
    }
  }

  function startResize(key: K, event: MouseEvent): void {
    event.preventDefault()
    const startX = event.clientX
    const startWidth = widths.value[key]

    const onMove = (moveEvent: MouseEvent): void => {
      const delta = moveEvent.clientX - startX
      const next = Math.max(MIN_WIDTH, startWidth + delta)
      widths.value = { ...widths.value, [key]: next }
    }

    const onUp = (): void => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.userSelect = ''
    }

    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function widthStyle(key: K): { width: string } {
    return { width: `${widths.value[key]}px` }
  }

  return { widths, startResize, widthStyle }
}
