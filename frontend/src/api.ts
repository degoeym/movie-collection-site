import type { Movie, NewMovieDto, UpdateMovieDto } from './types'
import { ApiError, normalizeProblemDetails } from './utils/errors'

declare global {
  interface Window {
    __APP_CONFIG__?: { API_BASE_URL?: string }
  }
}

const BASE_URL = window.__APP_CONFIG__?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init
  })
  if (!res.ok) {
    let data: any = null
    let message = `Request failed: ${res.status}`
    let parsedJson = false
    try {
      data = await res.clone().json()
      parsedJson = true
    } catch {}
    if (parsedJson) {
      const normalized = normalizeProblemDetails(data)
      const firstFieldMessage = Object.values(normalized.fieldErrors)[0]?.[0]
      const general = normalized.generalErrors[0]
      message = firstFieldMessage || general || data?.title || message
      throw new ApiError(message, { status: res.status, data, normalized })
    } else {
      try {
        const text = await res.text()
        if (text) message = text
      } catch {}
      throw new ApiError(message, { status: res.status })
    }
  }
  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

export const api = {
  listMovies: () => http<Movie[]>('/movies'),
  getMovie: (id: string) => http<Movie>(`/movies/${id}`),
  createMovie: (dto: NewMovieDto) => http<Movie>('/movies', { method: 'POST', body: JSON.stringify(dto) }),
  updateMovie: (id: string, dto: UpdateMovieDto) => http<void>(`/movies/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  deleteMovie: (id: string) => http<Movie>(`/movies/${id}`, { method: 'DELETE' })
}
