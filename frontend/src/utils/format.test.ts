import { describe, it, expect } from 'vitest'
import { formatRating } from './format'

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
})
