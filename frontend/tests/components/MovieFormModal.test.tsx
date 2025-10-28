import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MovieFormModal from '../../src/components/MovieFormModal'
import type { Movie } from '../../src/types'
import { ApiError } from '../../src/utils/errors'

const baseMovie: Movie = {
  id: 'm1',
  title: 'Interstellar',
  description: 'Travel through space and time.',
  rating: 'PG13',
  releaseDate: '2014-11-07T00:00:00.000Z',
  createdAt: '2014-01-01T00:00:00.000Z',
  updatedAt: '2014-01-01T00:00:00.000Z'
}

describe('MovieFormModal', () => {
  it('does not render when hidden', () => {
    const { container } = render(
      <MovieFormModal show={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('prefills fields in edit mode', () => {
    render(
      <MovieFormModal show onClose={vi.fn()} onSubmit={vi.fn()} movie={baseMovie} />
    )

    expect(screen.getByRole('heading', { name: /edit movie/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toHaveValue(baseMovie.title)
    expect(screen.getByLabelText(/description/i)).toHaveValue(baseMovie.description)
    expect(screen.getByLabelText(/release date/i)).toHaveValue('2014-11-07')
    expect(screen.getByLabelText(/rating/i)).toHaveValue(baseMovie.rating)
  })

  it('submits trimmed payloads in create mode', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <MovieFormModal show onClose={onClose} onSubmit={onSubmit} />
    )

    await user.clear(screen.getByLabelText(/title/i))
    await user.type(screen.getByLabelText(/title/i), '  Dune  ')
    await user.clear(screen.getByLabelText(/description/i))
    await user.type(screen.getByLabelText(/description/i), '  Spice must flow ')
    await user.selectOptions(screen.getByLabelText(/rating/i), 'R')
    await user.clear(screen.getByLabelText(/release date/i))
    await user.type(screen.getByLabelText(/release date/i), '2021-10-22')

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    const payload = onSubmit.mock.calls[0][0]
    expect(payload).toEqual({
      title: 'Dune',
      description: 'Spice must flow',
      rating: 'R',
      releaseDate: new Date('2021-10-22').toISOString()
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('displays field validation errors from ApiError', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError('validation failed', {
        normalized: {
          fieldErrors: { title: ['Title is required.'] },
          generalErrors: []
        }
      })
    )

    render(
      <MovieFormModal show onClose={vi.fn()} onSubmit={onSubmit} />
    )

    await user.type(screen.getByLabelText(/release date/i), '2024-01-01')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText('Title is required.')).toBeInTheDocument()
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('displays general messages for non-field errors', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiError('Request failed', {
        normalized: {
          fieldErrors: {},
          generalErrors: ['Server unhappy']
        }
      })
    )

    render(
      <MovieFormModal show onClose={vi.fn()} onSubmit={onSubmit} />
    )

    await user.type(screen.getByLabelText(/release date/i), '2024-01-01')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Server unhappy')
    })
  })
})
