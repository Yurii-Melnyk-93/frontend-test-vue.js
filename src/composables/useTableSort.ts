import { computed, ref, toValue, type ComputedRef, type MaybeRefOrGetter, type Ref } from 'vue'
import type { SortDirection, SortState } from '@/types/api'

type SortableValue = string | number

export interface UseTableSortReturn<T, K extends string> {
  sortState: Ref<SortState<K> | null>
  sortedItems: ComputedRef<T[]>
  toggleSort: (key: K) => void
  directionFor: (key: K) => SortDirection | null
}

/**
 * Generic table-sort hook. Takes items and a "key → extractor" map.
 * Clicking a header toggles direction (asc → desc). State can be held externally
 * (e.g. `useLocalStorage`) for persistence.
 */
export function useTableSort<T, K extends string>(
  items: MaybeRefOrGetter<T[]>,
  accessors: Record<K, (item: T) => SortableValue>,
  externalState?: Ref<SortState<K> | null>,
): UseTableSortReturn<T, K> {
  const sortState: Ref<SortState<K> | null> =
    externalState ?? (ref<SortState<K> | null>(null) as Ref<SortState<K> | null>)

  function compare(a: SortableValue, b: SortableValue): number {
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b
    }
    return String(a).localeCompare(String(b), 'uk', { numeric: true })
  }

  const sortedItems = computed<T[]>(() => {
    const source = [...toValue(items)]
    const state = sortState.value
    if (state === null) {
      return source
    }
    const accessor = accessors[state.key]
    const factor = state.direction === 'asc' ? 1 : -1
    return source.sort((a, b) => factor * compare(accessor(a), accessor(b)))
  })

  function toggleSort(key: K): void {
    const state = sortState.value
    if (state === null || state.key !== key) {
      sortState.value = { key, direction: 'asc' }
      return
    }
    sortState.value = {
      key,
      direction: state.direction === 'asc' ? 'desc' : 'asc',
    }
  }

  function directionFor(key: K): SortDirection | null {
    return sortState.value?.key === key ? sortState.value.direction : null
  }

  return { sortState, sortedItems, toggleSort, directionFor }
}
