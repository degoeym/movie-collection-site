export type FieldErrors = Record<string, string[]>

export type NormalizedErrors = {
  fieldErrors: FieldErrors
  generalErrors: string[]
  status?: number
  title?: string
}

// Known generic title returned by ASP.NET for validation problems
const DEFAULT_VALIDATION_TITLE = 'One or more validation errors occurred.'

function decapitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toLowerCase() + s.slice(1)
}

// Normalize server-side field keys (e.g., "Title" or "Movie.Title") to client field keys (e.g., "title")
function normalizeFieldKey(key: string): string {
  if (!key) return key
  // If key is nested like "updatedMovie.ReleaseDate", take the last segment
  const last = key.split(/[.\]\[]/).filter(Boolean).pop() || key
  // Convert simple PascalCase to camelCase by decapitalizing the first char
  const basic = decapitalize(last)
  // Allow explicit mapping for known fields if needed
  switch (last) {
    case 'ReleaseDate':
      return 'releaseDate'
    case 'Rating':
      return 'rating'
    case 'Title':
      return 'title'
    case 'Description':
      return 'description'
    default:
      return basic
  }
}

export function normalizeProblemDetails(input: any): NormalizedErrors {
  const out: NormalizedErrors = {
    fieldErrors: {},
    generalErrors: [],
    status: typeof input?.status === 'number' ? input.status : undefined,
    title: typeof input?.title === 'string' ? input.title : undefined
  }

  // Validation errors dictionary: { field: string[] }
  if (input && typeof input === 'object' && input.errors && typeof input.errors === 'object') {
    for (const [key, value] of Object.entries(input.errors as Record<string, unknown>)) {
      const normKey = normalizeFieldKey(key)
      const arr = Array.isArray(value) ? (value.filter(v => typeof v === 'string') as string[]) : []
      if (!arr.length) continue
      if (!out.fieldErrors[normKey]) out.fieldErrors[normKey] = []
      out.fieldErrors[normKey].push(...arr)
    }
  }

  // Include human-friendly message for non-validation problems
  const maybeDetails: string[] = []
  if (typeof input?.detail === 'string' && input.detail.trim()) maybeDetails.push(input.detail.trim())
  if (typeof input?.title === 'string' && input.title.trim() && input.title !== DEFAULT_VALIDATION_TITLE) {
    maybeDetails.push(input.title.trim())
  }

  // Add any non-empty unique messages as general errors
  for (const msg of maybeDetails) {
    if (msg && !out.generalErrors.includes(msg)) out.generalErrors.push(msg)
  }

  return out
}

export class ApiError extends Error {
  status?: number
  data?: any
  normalized?: NormalizedErrors
  constructor(message: string, options?: { status?: number; data?: any; normalized?: NormalizedErrors }) {
    super(message)
    this.name = 'ApiError'
    this.status = options?.status
    this.data = options?.data
    this.normalized = options?.normalized
  }
}

export function isApiError(err: unknown): err is ApiError {
  return !!err && typeof err === 'object' && (err as any).name === 'ApiError'
}
