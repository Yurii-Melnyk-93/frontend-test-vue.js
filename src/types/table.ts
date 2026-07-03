import type { SortState } from '@/types/api'

/** Horizontal alignment of a table cell / header. */
export type TableAlign = 'left' | 'right' | 'center'

/** Single column definition for {@link BaseTable}. */
export interface TableColumn<T> {
  /** Unique column id — also the name of the optional per-cell slot (`#<key>`). Avoid `actions`. */
  key: string
  /** Header text. */
  label: string
  /** Cell/header alignment. Defaults to `left`. */
  align?: TableAlign
  /** Whether the header toggles sorting for this column. */
  sortable?: boolean
  /** Value extractor used for sorting (required when `sortable` is set). */
  sortAccessor?: (row: T) => string | number
  /** Initial / default column width in px. */
  width?: number
}

/**
 * Whole table configuration passed to {@link BaseTable} as a single `config` prop.
 * Keeps the component call-site tidy — every knob lives here.
 */
export interface TableConfig<T> {
  /** Column definitions (headers + how to read/sort each cell). */
  columns: TableColumn<T>[]
  /** Row data. */
  rows: T[]
  /** How to derive a row's `:key`. Field name or getter. Defaults to `id`. */
  rowKey?: keyof T | ((row: T) => string | number)
  /** Enable column-edge resizing (drag). */
  resizable?: boolean
  /** Make whole rows clickable (emits `row-click`). */
  clickableRows?: boolean
  /** Text shown when there are no rows. */
  emptyText?: string
  /** Header label for the actions column (only rendered when an `actions` slot is passed). */
  actionsLabel?: string
  /** Width of the actions column in px. */
  actionsWidth?: number
  /** localStorage key prefix — persists sort state (`.sort`) and widths (`.widths`). */
  storageKey?: string
  /** Initial sort state when nothing is persisted. */
  defaultSort?: SortState<string> | null
  /**
   * When set, rows render incrementally: this many at first, loading another
   * batch of the same size each time the user scrolls near the bottom.
   * Omit to render every row at once.
   */
  pageSize?: number
}
