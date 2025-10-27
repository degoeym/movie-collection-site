import { describe, expect, it } from 'vitest'
import { normalizeProblemDetails } from './errors'

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
  })

  it('handles non-validation problem details', () => {
    const input = {
      title: 'An error occurred.',
      detail: 'Oops',
      status: 500
    }
    const n = normalizeProblemDetails(input)
    expect(n.generalErrors).toContain('Oops')
    expect(n.generalErrors).toContain('An error occurred.')
  })
})
