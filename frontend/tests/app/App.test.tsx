import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Movie, NewMovieDto } from '../../src/types'

const apiMock = vi.hoisted(() => ({
  listMovies: vi.fn<() => Promise<Movie[]>>(),
  createMovie: vi.fn<(dto: NewMovieDto) => Promise<void | Movie>>(),
  updateMovie: vi.fn<(id: string, dto: NewMovieDto) => Promise<void>>(),
  deleteMovie: vi.fn<(id: string) => Promise<void>>(),
  getMovie: vi.fn()
}))

const { listMovies, createMovie, updateMovie, deleteMovie, getMovie } = apiMock

vi.mock('../../src/api', () => ({
  api: apiMock
}))

import App from '../../src/App'

const baseMovies: Movie[] = [
  {
    id: '1',
    title: 'Arrival',
    description: 'Language and aliens.',
    rating: 'PG13',
    releaseDate: '2016-11-11T00:00:00.000Z',
    createdAt: '2016-01-01T00:00:00.000Z',
    updatedAt: '2016-01-01T00:00:00.000Z'
  }
]

describe('App', () => {
  beforeEach(() => {
    listMovies.mockReset()
    createMovie.mockReset()
    updateMovie.mockReset()
    deleteMovie.mockReset()
    getMovie.mockReset()
  })

  it('loads and renders movies', async () => {
    listMovies.mockResolvedValueOnce(baseMovies)

    render(<App />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(await screen.findByText('Arrival')).toBeInTheDocument()
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('shows an error when loading fails', async () => {
    listMovies.mockRejectedValueOnce(new Error('Boom'))

    render(<App />)

  expect(await screen.findByRole('alert')).toHaveTextContent('Boom')
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('asks for confirmation before deleting and respects cancel', async () => {
    listMovies.mockResolvedValueOnce(baseMovies)
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<App />)

    await screen.findByText('Arrival')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(confirmSpy).toHaveBeenCalledWith('Delete Arrival?')
    expect(deleteMovie).not.toHaveBeenCalled()
  })

  it('deletes a movie after confirmation and refreshes list', async () => {
    listMovies
      .mockResolvedValueOnce(baseMovies)
      .mockResolvedValueOnce([])
  deleteMovie.mockResolvedValueOnce(undefined)
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)

    await screen.findByText('Arrival')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /delete/i }))

    await waitFor(() => {
      expect(deleteMovie).toHaveBeenCalledWith('1')
    })
    expect(confirmSpy).toHaveBeenCalled()
    expect(await screen.findByText(/no movies yet/i)).toBeInTheDocument()
  })

  it('creates a movie and refreshes after submission', async () => {
    const newMovie: Movie = {
      id: '2',
      title: 'Dune',
      description: 'Desert power.',
      rating: 'PG13',
      releaseDate: '2021-10-22T00:00:00.000Z',
      createdAt: '2021-10-22T00:00:00.000Z',
      updatedAt: '2021-10-22T00:00:00.000Z'
    }

    listMovies
      .mockResolvedValueOnce(baseMovies)
      .mockResolvedValueOnce([...baseMovies, newMovie])
  createMovie.mockResolvedValueOnce(newMovie)

    render(<App />)

    await screen.findByText('Arrival')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /add movie/i }))

    await user.clear(screen.getByLabelText(/title/i))
    await user.type(screen.getByLabelText(/title/i), newMovie.title)
    await user.clear(screen.getByLabelText(/description/i))
    await user.type(screen.getByLabelText(/description/i), newMovie.description)
    await user.clear(screen.getByLabelText(/release date/i))
    await user.type(screen.getByLabelText(/release date/i), '2021-10-22')
    // Rating defaults to PG, adjust to align with expected value
    await user.selectOptions(screen.getByLabelText(/rating/i), newMovie.rating)

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(createMovie).toHaveBeenCalledTimes(1)
    })
    expect(createMovie.mock.calls[0][0]).toEqual({
      title: newMovie.title,
      description: newMovie.description,
      rating: newMovie.rating,
      releaseDate: new Date('2021-10-22').toISOString()
    })

    expect(await screen.findByText('Dune')).toBeInTheDocument()
  })

  it('edits a movie and calls updateMovie with id', async () => {
    listMovies
      .mockResolvedValueOnce(baseMovies)
      .mockResolvedValueOnce([
        { ...baseMovies[0], title: 'Arrival (Extended)' }
      ])
  updateMovie.mockResolvedValueOnce(undefined)

    render(<App />)

    await screen.findByText('Arrival')
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /edit/i }))

    const titleInput = screen.getByLabelText(/title/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'Arrival (Extended)')
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(updateMovie).toHaveBeenCalledWith('1', expect.objectContaining({
        title: 'Arrival (Extended)'
      }))
    })

    expect(await screen.findByText('Arrival (Extended)')).toBeInTheDocument()
  })
})
