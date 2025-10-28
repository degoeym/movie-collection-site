import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Movie } from '../../src/types'

const API_BASE_URL = 'https://api.test'

declare global {
  interface Window {
    __APP_CONFIG__?: { API_BASE_URL?: string }
  }
}

beforeEach(() => {
  vi.resetModules()
  vi.restoreAllMocks()
  window.__APP_CONFIG__ = { API_BASE_URL }
})

afterEach(() => {
  delete window.__APP_CONFIG__
})

describe('api', () => {
  it('fetches movies successfully', async () => {
    const movies: Movie[] = [
      {
        id: '1',
        title: 'The Matrix',
        description: 'Sci-fi classic',
        rating: 'R',
        releaseDate: '1999-03-31T00:00:00.000Z',
        createdAt: '1999-01-01T00:00:00.000Z',
        updatedAt: '1999-01-01T00:00:00.000Z'
      }
    ]
    const mockJson = vi.fn().mockResolvedValue(movies)
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: mockJson
    })
    globalThis.fetch = fetchMock

    const { api } = await import('../../src/api')
    const result = await api.listMovies()

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/movies`, expect.objectContaining({
      headers: expect.objectContaining({ 'Content-Type': 'application/json' })
    }))
    expect(result).toEqual(movies)
    expect(mockJson).toHaveBeenCalledTimes(1)
  })

  it('throws ApiError with normalized message when server returns validation errors', async () => {
    const body = {
      errors: {
        Title: ['Title is required.']
      }
    }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      clone: () => ({ json: vi.fn().mockResolvedValue(body) }),
      json: vi.fn().mockResolvedValue(body)
    })
    globalThis.fetch = fetchMock

    const { api } = await import('../../src/api')

    await expect(api.createMovie({
      title: '',
      description: '',
      rating: 'PG',
      releaseDate: new Date().toISOString()
    })).rejects.toMatchObject({
      message: 'Title is required.',
      status: 400,
      normalized: {
        fieldErrors: { title: ['Title is required.'] }
      }
    })
  })

  it('surfaces text responses when JSON parsing fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      clone: () => ({ json: vi.fn().mockRejectedValue(new Error('no json')) }),
      json: vi.fn().mockRejectedValue(new Error('no json')),
      text: vi.fn().mockResolvedValue('Server exploded')
    })
    globalThis.fetch = fetchMock

    const { api } = await import('../../src/api')

    await expect(api.getMovie('1')).rejects.toMatchObject({
      message: 'Server exploded',
      status: 500
    })
  })

  it('handles 204 responses gracefully for deleteMovie', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: vi.fn()
    })
    globalThis.fetch = fetchMock

    const { api } = await import('../../src/api')

    const result = await api.deleteMovie('123')
    expect(result).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/movies/123`, expect.objectContaining({
      method: 'DELETE'
    }))
  })
})
