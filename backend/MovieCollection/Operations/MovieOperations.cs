using Microsoft.EntityFrameworkCore;
using MovieCollection.Data;
using MovieCollection.Data.DTOs;
using MovieCollection.Data.Models;
using MovieCollection.Mappers;

namespace MovieCollection.Operations;

public interface IMovieOperations
{
    public Task<Movie> AddMovieAsync(NewMovieDto movie);
    public Task<Movie?> DeleteMovieAsync(Guid id);
    public Task<Movie?> GetMovieAsync(Guid id);
    public Task<Movie?> UpdateMovieAsync(Guid id, UpdateMovieDto updateMovie);
    public Task<IEnumerable<Movie>> GetMoviesAsync();
}

public class MovieOperations : IMovieOperations
{
    private readonly MovieCollectionContext _context;

    public MovieOperations(MovieCollectionContext context)
    {
        _context = context;
    }

    public async Task<Movie> AddMovieAsync(NewMovieDto newMovie)
    {
        var mapper = new MovieMapper();
        var movie = mapper.NewMovieDtoToMovie(newMovie);
        movie.CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
        movie.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);

        _context.Movies.Add(movie);
        await _context.SaveChangesAsync();

        return movie;
    }

    public async Task<Movie?> DeleteMovieAsync(Guid id)
    {
        if (await _context.Movies.FindAsync(id) is Movie movie)
        {
            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();

            return movie;
        }

        return null;
    }

    public async Task<Movie?> UpdateMovieAsync(Guid id, UpdateMovieDto updatedMovie)
    {
        var originalMovie = await _context.Movies.FindAsync(id);

        if (originalMovie is null)
            return null;

        var mapper = new MovieMapper();
        mapper.UpdateMovieFromDto(updatedMovie, originalMovie);
        originalMovie.UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
        await _context.SaveChangesAsync();

        return originalMovie;
    }

    public async Task<Movie?> GetMovieAsync(Guid id)
    {
        return await _context.Movies.FindAsync(id) is Movie movie ? movie : null;
    }

    public async Task<IEnumerable<Movie>> GetMoviesAsync()
    {
        return await _context.Movies.ToArrayAsync();
    }
}
