import { Movie } from '../types'
import { formatDate, formatRating } from '../utils/format'

type Props = {
  movies: Movie[]
  onEdit: (movie: Movie) => void
  onDelete: (movie: Movie) => void
}

export default function MoviesTable({ movies, onEdit, onDelete }: Props) {
  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Rating</th>
            <th>Release</th>
            <th style={{ width: 140 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map(m => (
            <tr key={m.id}>
              <td>{m.title}</td>
              <td>{m.description}</td>
              <td>{formatRating(m.rating)}</td>
              <td>{formatDate(m.releaseDate)}</td>
              <td>
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-outline-primary" onClick={() => onEdit(m)}>Edit</button>
                  <button className="btn btn-outline-danger" onClick={() => onDelete(m)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {movies.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center text-muted">No movies yet</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
