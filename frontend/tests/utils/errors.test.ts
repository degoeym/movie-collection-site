import { describe, expect, it } from 'vitest'
import { ApiError, isApiError, normalizeProblemDetails } from '../../src/utils/errors'

describe('normalizeProblemDetails', () => {
  it('maps ASP.NET validation errors to fieldErrors', () => {
    const input = {
      title: 'One or more validation errors occurred.',
      status: 400,
      errors: {
        Title: ['The Title field is required.'],
        Description: ['The Description field is required.'],
        ReleaseDate: ['The ReleaseDate field is not a valid date.']
      }
    }
    const n = normalizeProblemDetails(input)
    expect(n.fieldErrors.title).toEqual(['The Title field is required.'])
    expect(n.fieldErrors.description).toEqual(['The Description field is required.'])
    expect(n.fieldErrors.releaseDate).toEqual(['The ReleaseDate field is not a valid date.'])
    expect(n.status).toBe(400)
    expect(n.title).toBe(input.title)
  })

  it('normalizes nested field keys to leaf segments', () => {
    const input = {
      errors: {
        'movie[0].Rating': ['Rating is required.'],
        'updateMovie.ReleaseDate': ['Release date is invalid.']
      }
    }
    const n = normalizeProblemDetails(input)
    expect(n.fieldErrors.rating).toEqual(['Rating is required.'])
    expect(n.fieldErrors.releaseDate).toEqual(['Release date is invalid.'])
  })

  it('deduplicates empty or missing data', () => {
    const n = normalizeProblemDetails(null)
    expect(n.fieldErrors).toEqual({})
    expect(n.generalErrors).toEqual([])
  })

  it('collects detail messages for non-validation problems', () => {
    const input = {
      title: 'An error occurred.',
      detail: 'Oops',
      status: 500
    }
    const n = normalizeProblemDetails(input)
    expect(n.generalErrors).toContain('Oops')
    expect(n.generalErrors).toContain('An error occurred.')
    expect(n.fieldErrors).toEqual({})
  })
})

describe('ApiError', () => {
  it('retains message, status, and normalized payload', () => {
    const normalized = {
      fieldErrors: { title: ['required'] },
      generalErrors: [],
      status: 400,
      title: 'Bad Request'
    }
    const err = new ApiError('Request failed', { status: 400, data: { foo: 'bar' }, normalized })
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('Request failed')
    expect(err.status).toBe(400)
    expect(err.data).toEqual({ foo: 'bar' })
    expect(err.normalized).toEqual(normalized)
  })

  it('is detected by isApiError', () => {
    const err = new ApiError('nope')
    expect(isApiError(err)).toBe(true)
    expect(isApiError(new Error('plain'))).toBe(false)
    expect(isApiError(null)).toBe(false)
  })
})
