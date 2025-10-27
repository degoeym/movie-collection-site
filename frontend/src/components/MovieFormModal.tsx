import { useEffect, useMemo, useState } from 'react'
import type { Movie, NewMovieDto, Rating } from '../types'
import { isApiError } from '../utils/errors'

type Props = {
  show: boolean
  onClose: () => void
  onSubmit: (payload: NewMovieDto) => Promise<void>
  movie?: Movie | null
}

const RATING_OPTIONS: { label: string; value: Rating }[] = [
  { label: 'G', value: 'G' },
  { label: 'PG', value: 'PG' },
  { label: 'PG-13', value: 'PG13' },
  { label: 'R', value: 'R' },
  { label: 'NC-17', value: 'NC17' },
  { label: 'X', value: 'X' },
  { label: 'N/R', value: 'Unknown' }
]

export default function MovieFormModal({ show, onClose, onSubmit, movie }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState<Rating>('PG')
  const [releaseDate, setReleaseDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (movie) {
      setTitle(movie.title)
      setDescription(movie.description)
      setRating(movie.rating)
      setReleaseDate(movie.releaseDate.slice(0, 10))
    } else {
      setTitle('')
      setDescription('')
      setRating('PG')
      setReleaseDate('')
    }
    // Reset errors when modal opens or target movie changes
    setError(null)
    setFieldErrors({})
  }, [movie, show])

  const isEdit = useMemo(() => Boolean(movie), [movie])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload: NewMovieDto = {
        title: title.trim(),
        description: description.trim(),
        rating,
        releaseDate: new Date(releaseDate).toISOString()
      }
      await onSubmit(payload)
      onClose()
    } catch (err: any) {
      // Prefer displaying the messages exactly as returned by the server
      if (isApiError(err) && err.normalized) {
        const fields = err.normalized.fieldErrors || {}
        const hasFieldErrors = Object.keys(fields).length > 0
        setFieldErrors(fields)
        // For validation problems, rely on field-level messages only
        if (hasFieldErrors) {
          setError(null)
        } else {
          // For general problems, join server-provided messages as-is
          const general = (err.normalized.generalErrors || [])
          setError(general.length ? general.join('\n') : (err.message || 'Request failed'))
        }
      } else {
        setError(err?.message || 'Failed to submit')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal d-block" tabIndex={-1} role="dialog" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isEdit ? 'Edit Movie' : 'Add Movie'}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" style={{ whiteSpace: 'pre-wrap' }}>
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  className={`form-control ${fieldErrors.title?.length ? 'is-invalid' : ''}`}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                {fieldErrors.title?.length ? (
                  <div className="invalid-feedback">
                    {fieldErrors.title.map((msg, idx) => (
                      <div key={idx}>{msg}</div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className={`form-control ${fieldErrors.description?.length ? 'is-invalid' : ''}`}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                {fieldErrors.description?.length ? (
                  <div className="invalid-feedback">
                    {fieldErrors.description.map((msg, idx) => (
                      <div key={idx}>{msg}</div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Rating</label>
                  <select
                    className={`form-select ${fieldErrors.rating?.length ? 'is-invalid' : ''}`}
                    value={rating}
                    onChange={e => setRating(e.target.value as Rating)}
                  >
                    {RATING_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {fieldErrors.rating?.length ? (
                    <div className="invalid-feedback">
                      {fieldErrors.rating.map((msg, idx) => (
                        <div key={idx}>{msg}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Release Date</label>
                  <input
                    type="date"
                    className={`form-control ${fieldErrors.releaseDate?.length ? 'is-invalid' : ''}`}
                    value={releaseDate}
                    onChange={e => setReleaseDate(e.target.value)}
                  />
                  {fieldErrors.releaseDate?.length ? (
                    <div className="invalid-feedback">
                      {fieldErrors.releaseDate.map((msg, idx) => (
                        <div key={idx}>{msg}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
