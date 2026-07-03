/** Unified API-layer error. */
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Table sort direction. */
export type SortDirection = 'asc' | 'desc'

/** Table sort state for a specific key. */
export interface SortState<TKey extends string> {
  key: TKey
  direction: SortDirection
}
