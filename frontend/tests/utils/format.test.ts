import { describe, expect, it, vi } from 'vitest'
import { formatDate, formatRating } from '../../src/utils/format'

describe('formatRating', () => {
  it('leaves simple ratings unchanged', () => {
    expect(formatRating('G')).toBe('G')
    expect(formatRating('PG')).toBe('PG')
    expect(formatRating('R')).toBe('R')
    expect(formatRating('X')).toBe('X')
    expect(formatRating('Unknown')).toBe('Unknown')
  })

  it('formats PG13 as PG-13', () => {
    expect(formatRating('PG13')).toBe('PG-13')
  })

  it('formats NC17 as NC-17', () => {
    expect(formatRating('NC17')).toBe('NC-17')
  })

  it('returns empty string for falsy inputs', () => {
    expect(formatRating('')).toBe('')
    // @ts-expect-error formatRating receives string but test handles runtime scenario
    expect(formatRating(undefined)).toBe('')
  })
})

describe('formatDate', () => {
  it('returns empty string when date is missing', () => {
    expect(formatDate('')).toBe('')
    // @ts-expect-error testing runtime guard against undefined
    expect(formatDate(undefined)).toBe('')
  })

  it('falls back to original input when date is invalid', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })

  it('delegates to toLocaleDateString for valid input', () => {
    const spy = vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('1/2/2024')
    const result = formatDate('2024-01-02T00:00:00.000Z')
    expect(result).toBe('1/2/2024')
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
