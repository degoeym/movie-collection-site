import { useEffect, useState } from 'react'
import { api } from './api'
import type { Movie, NewMovieDto } from './types'
import MoviesTable from './components/MoviesTable'
import MovieFormModal from './components/MovieFormModal'

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Movie | null>(null)

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    setError(null)
    setLoading(true)
    try {
      const data = await api.listMovies()
      setMovies(data)
    } catch (err: any) {
      setError(err?.message || 'Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setShowModal(true)
  }

  function openEdit(movie: Movie) {
    setEditing(movie)
    setShowModal(true)
  }

  async function handleSubmit(payload: NewMovieDto) {
    if (editing) {
      await api.updateMovie(editing.id, payload)
    } else {
      await api.createMovie(payload)
    }
    await refresh()
  }

  async function handleDelete(movie: Movie) {
    if (!confirm(`Delete ${movie.title}?`)) return
    await api.deleteMovie(movie.id)
    await refresh()
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Movie Collection</h1>
        <button className="btn btn-primary" onClick={openAdd}>Add Movie</button>
      </div>
  {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : (
        <MoviesTable movies={movies} onEdit={openEdit} onDelete={handleDelete} />
      )}
      <MovieFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        movie={editing}
      />
    </div>
  )
}
