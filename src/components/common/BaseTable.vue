<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="col in config.columns"
            :key="col.key"
            :style="widthStyle(col.key)"
            class="th"
            :class="alignClass(col.align)"
          >
            <button
              v-if="col.sortable"
              class="th__sort"
              type="button"
              @click="toggleSort(col.key)"
            >
              <span class="th__label">{{ col.label }}</span>
              <span class="th__sorticon" aria-hidden="true">
                <span
                  class="th__caret th__caret--up"
                  :class="{ 'th__caret--active': directionFor(col.key) === 'asc' }"
                />
                <span
                  class="th__caret th__caret--down"
                  :class="{ 'th__caret--active': directionFor(col.key) === 'desc' }"
                />
              </span>
              <span
                class="th__clear"
                :class="{ 'th__clear--visible': directionFor(col.key) }"
                role="button"
                title="Скинути сортування"
                @click.stop="sortState = null"
                >×</span
              >
            </button>
            <span v-else class="th__label th__label--plain">{{ col.label }}</span>
            <span
              v-if="config.resizable"
              class="th__resizer"
              @mousedown="startResize(col.key, $event)"
            />
          </th>
          <th
            v-if="hasActions"
            class="th th--actions"
            :style="{ width: `${config.actionsWidth ?? 96}px` }"
          >
            {{ config.actionsLabel ?? 'Дії' }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in visibleRows"
          :key="keyOf(row)"
          class="row"
          :class="{ 'row--clickable': config.clickableRows }"
          @click="config.clickableRows && emit('row-click', row)"
        >
          <td
            v-for="col in config.columns"
            :key="col.key"
            :style="widthStyle(col.key)"
            class="td"
            :class="alignClass(col.align)"
          >
            <slot :name="col.key" :row="row" :value="cellValue(row, col.key)">
              {{ cellValue(row, col.key) }}
            </slot>
          </td>
          <td v-if="hasActions" class="td td--actions" @click.stop>
            <slot name="actions" :row="row" />
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="hasMore"
      ref="sentinel"
      class="table-sentinel"
      aria-hidden="true"
    />

    <p v-if="isEmpty" class="table-empty">{{ config.emptyText ?? 'Немає даних.' }}</p>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch, type Ref } from 'vue'
import { useTableSort } from '@/composables/useTableSort'
import { useColumnResize } from '@/composables/useColumnResize'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type { SortState } from '@/types/api'
import type { TableAlign, TableConfig } from '@/types/table'

const props = defineProps<{ config: TableConfig<T> }>()
const emit = defineEmits<{ 'row-click': [row: T] }>()

const slots = useSlots()
const hasActions = computed(() => slots.actions !== undefined)

// Column definitions are static per call-site, so it's safe to snapshot them.
const columnDefaults: Record<string, number> = Object.fromEntries(
  props.config.columns.map((col) => [col.key, col.width ?? 160]),
)

const accessors: Record<string, (row: T) => string | number> = Object.fromEntries(
  props.config.columns
    .filter((col) => col.sortAccessor !== undefined)
    .map((col) => [col.key, col.sortAccessor as (row: T) => string | number]),
)

// Persist sort + widths when a storage key is provided, otherwise keep them local.
const sortState: Ref<SortState<string> | null> = props.config.storageKey
  ? useLocalStorage<SortState<string> | null>(
      `${props.config.storageKey}.sort`,
      props.config.defaultSort ?? null,
    )
  : ref<SortState<string> | null>(props.config.defaultSort ?? null)

const widths: Ref<Record<string, number>> = props.config.storageKey
  ? useLocalStorage<Record<string, number>>(`${props.config.storageKey}.widths`, columnDefaults)
  : ref<Record<string, number>>({ ...columnDefaults })

const { sortedItems, toggleSort, directionFor } = useTableSort<T, string>(
  () => props.config.rows,
  accessors,
  sortState,
)

const { startResize, widthStyle } = useColumnResize<string>(columnDefaults, widths)

const isEmpty = computed(() => sortedItems.value.length === 0)

// Incremental rendering ("load more on scroll") — active only when `pageSize` is set.
const visibleCount = ref(props.config.pageSize ?? Number.POSITIVE_INFINITY)

const visibleRows = computed<T[]>(() =>
  props.config.pageSize === undefined
    ? sortedItems.value
    : sortedItems.value.slice(0, visibleCount.value),
)

const hasMore = computed(
  () => props.config.pageSize !== undefined && visibleCount.value < sortedItems.value.length,
)

// Restart paging from the top whenever the data set itself changes (filter / sort / reload).
watch(
  () => sortedItems.value.length,
  () => {
    if (props.config.pageSize !== undefined) {
      visibleCount.value = props.config.pageSize
    }
  },
)

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function loadMore(): void {
  const size = props.config.pageSize
  if (size === undefined || !hasMore.value) {
    return
  }
  visibleCount.value = Math.min(visibleCount.value + size, sortedItems.value.length)
  // Re-arm the observer so an under-filled viewport keeps loading until it's covered.
  const el = sentinel.value
  if (observer && el) {
    observer.unobserve(el)
    void nextTick(() => {
      if (observer && sentinel.value === el && hasMore.value) {
        observer.observe(el)
      }
    })
  }
}

onMounted(() => {
  if (props.config.pageSize === undefined) {
    return
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        loadMore()
      }
    },
    { rootMargin: '160px' },
  )
  // (Re)observe the sentinel whenever it appears — rows may arrive after mount.
  watch(
    sentinel,
    (el, _prev, onCleanup) => {
      if (observer && el) {
        observer.observe(el)
        onCleanup(() => observer?.unobserve(el))
      }
    },
    { immediate: true },
  )
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

function keyOf(row: T): string | number {
  const rowKey = props.config.rowKey
  if (typeof rowKey === 'function') {
    return rowKey(row)
  }
  const field = (rowKey ?? 'id') as keyof T
  return row[field] as unknown as string | number
}

function cellValue(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

function alignClass(align: TableAlign | undefined): string | null {
  if (align === 'right') return 'is-right'
  if (align === 'center') return 'is-center'
  return null
}
</script>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.table-wrap {
  @include card;
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.th {
  position: relative;
  text-align: left;
  padding: 0;
  border-bottom: 1px solid var(--color-border);
  // Column divider — a hint that the edge is draggable.
  border-right: 1px solid var(--color-border);
  // Gray header background — separates it from the rows.
  background: var(--color-bg);
  user-select: none;

  &:last-child {
    border-right: none;
  }

  &.is-right .th__sort,
  &.is-right .th__label--plain {
    justify-content: flex-end;
  }
  &.is-center .th__sort,
  &.is-center .th__label--plain {
    justify-content: center;
  }

  &__sort {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    min-width: 0;
    padding: var(--space-3) var(--space-4);
    border: none;
    background: transparent;
    font-weight: 600;
    font-size: 13px;
    color: var(--color-text-muted);
    cursor: pointer;

    &:hover {
      color: var(--color-text);
    }
  }

  &__label {
    white-space: nowrap;

    &--plain {
      display: flex;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      font-weight: 600;
      font-size: 13px;
      color: var(--color-text-muted);
    }
  }

  // Both arrows always visible, the active one is highlighted.
  &__sorticon {
    display: inline-flex;
    flex-direction: column;
    gap: 2px;
    flex: 0 0 auto;
  }

  &__caret {
    width: 0;
    height: 0;
    border-left: 3.5px solid transparent;
    border-right: 3.5px solid transparent;
    opacity: 0.35;
    transition: opacity 0.12s ease, border-color 0.12s ease;

    &--up {
      border-bottom: 5px solid var(--color-text-muted);
    }
    &--down {
      border-top: 5px solid var(--color-text-muted);
    }
    &--up.th__caret--active {
      border-bottom-color: var(--color-primary);
      opacity: 1;
    }
    &--down.th__caret--active {
      border-top-color: var(--color-primary);
      opacity: 1;
    }
  }

  &__clear {
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    width: 15px;
    height: 15px;
    margin-left: 2px;
    border-radius: 50%;
    font-size: 13px;
    line-height: 1;
    color: var(--color-text-muted);
    // Space for × is always reserved — the header doesn't shift when sorting.
    visibility: hidden;

    &--visible {
      visibility: visible;
    }

    &:hover {
      background: var(--color-border);
      color: var(--color-danger);
    }
  }

  &__resizer {
    position: absolute;
    top: 0;
    right: 0;
    width: 6px;
    height: 100%;
    cursor: col-resize;

    &:hover {
      background: var(--color-primary);
      opacity: 0.4;
    }
  }

  &--actions {
    text-align: right;
    padding: var(--space-3) var(--space-4);
    font-weight: 600;
    font-size: 13px;
    color: var(--color-text-muted);
  }
}

.row {
  transition: background 0.12s ease;

  &--clickable {
    cursor: pointer;
  }

  &:hover {
    background: var(--color-bg);
  }

  // Last row has no border — avoids doubling with the card edge.
  &:last-child .td {
    border-bottom: none;
  }
}

.td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
  vertical-align: middle;

  &.is-right {
    text-align: right;
  }
  &.is-center {
    text-align: center;
  }

  &--actions {
    text-align: right;
    white-space: nowrap;
  }
}

.table-sentinel {
  // Invisible tripwire the IntersectionObserver watches to load the next batch.
  height: 1px;
}

.table-empty {
  padding: var(--space-5);
  text-align: center;
  color: var(--color-text-muted);
}
</style>
