import axios, { AxiosError, type AxiosInstance } from 'axios'
import { mockAdapter } from './mockAdapter'
import { ApiError } from '@/types/api'

/**
 * Single Axios instance. Instead of a backend, a localStorage-backed `mockAdapter`
 * is plugged in; switching to a real server means dropping the `adapter` field.
 */
export const http: AxiosInstance = axios.create({
  baseURL: '/api',
  adapter: mockAdapter,
})

/** Normalizes any request error into an `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ?? error.message
    return new ApiError(message, status)
  }
  if (error instanceof Error) {
    return new ApiError(error.message, 0)
  }
  return new ApiError('Невідома помилка запиту', 0)
}
