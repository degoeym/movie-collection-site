import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MoviesTable from '../../src/components/MoviesTable'
import type { Movie } from '../../src/types'

const sampleMovie: Movie = {
  id: '1',
  title: 'Inception',
  description: 'A dream within a dream.',
  rating: 'PG13',
  releaseDate: '2010-07-16T00:00:00.000Z',
  createdAt: '2010-07-01T00:00:00.000Z',
  updatedAt: '2010-07-01T00:00:00.000Z'
}

describe('MoviesTable', () => {
  it('renders movie rows and formats values', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(<MoviesTable movies={[sampleMovie]} onEdit={onEdit} onDelete={onDelete} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Inception')).toBeInTheDocument()
    expect(screen.getByText('A dream within a dream.')).toBeInTheDocument()
    expect(screen.getByText('PG-13')).toBeInTheDocument()
    expect(onEdit).not.toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('invokes callbacks for edit/delete actions', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDelete = vi.fn()

    render(<MoviesTable movies={[sampleMovie]} onEdit={onEdit} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(sampleMovie)

    await user.click(screen.getByRole('button', { name: /delete/i }))
    expect(onDelete).toHaveBeenCalledWith(sampleMovie)
  })

  it('shows empty state when there are no movies', () => {
    render(<MoviesTable movies={[]} onEdit={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText(/no movies yet/i)).toBeInTheDocument()
  })
})
