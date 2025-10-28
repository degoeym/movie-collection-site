using System.Linq;
using Microsoft.EntityFrameworkCore;
using MovieCollection.Data;
using MovieCollection.Data.DTOs;
using MovieCollection.Data.Models;
using MovieCollection.Operations;
using Shouldly;

namespace MovieCollection.Tests.Operations;

public class MovieOperationsTests
{
    private static MovieCollectionContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<MovieCollectionContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new MovieCollectionContext(options);
    }

    private static NewMovieDto CreateNewMovieDto() => new()
    {
        Title = "Inception",
        Description = "A mind-bending thriller",
        Rating = Rating.PG13,
        ReleaseDate = DateTime.UtcNow.AddYears(-10)
    };

    private static Movie CreateExistingMovie(Guid? id = null) => new()
    {
        Id = id ?? Guid.NewGuid(),
        Title = "The Matrix",
        Description = "Welcome to the real world",
        Rating = Rating.R,
        ReleaseDate = DateTime.UtcNow.AddYears(-20),
        CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-5), DateTimeKind.Utc),
        UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-5), DateTimeKind.Utc)
    };

    [Fact]
    public async Task AddMovieAsync_ShouldPersistMovieAndSetTimestamps()
    {
        await using var context = CreateContext();
        var operations = new MovieOperations(context);
        var before = DateTime.UtcNow;

        var dto = CreateNewMovieDto();
        var movie = await operations.AddMovieAsync(dto);
        var after = DateTime.UtcNow;

        movie.ShouldNotBeNull();
        movie.Id.ShouldNotBe(Guid.Empty);
        movie.Title.ShouldBe(dto.Title);
        movie.Description.ShouldBe(dto.Description);
        movie.Rating.ShouldBe(dto.Rating);
        movie.ReleaseDate.ShouldBe(dto.ReleaseDate);
        movie.CreatedAt.Kind.ShouldBe(DateTimeKind.Utc);
        movie.UpdatedAt.Kind.ShouldBe(DateTimeKind.Utc);
        movie.CreatedAt.ShouldBeInRange(before, after);
        movie.UpdatedAt.ShouldBeInRange(before, after);
        (await context.Movies.CountAsync()).ShouldBe(1);
    }

    [Fact]
    public async Task DeleteMovieAsync_ShouldRemoveMovieWhenFound()
    {
        await using var context = CreateContext();
        var movie = CreateExistingMovie();
        await context.Movies.AddAsync(movie);
        await context.SaveChangesAsync();
        var operations = new MovieOperations(context);

        var deleted = await operations.DeleteMovieAsync(movie.Id);

        deleted.ShouldNotBeNull();
        deleted.Id.ShouldBe(movie.Id);
        (await context.Movies.CountAsync()).ShouldBe(0);
    }

    [Fact]
    public async Task DeleteMovieAsync_ShouldReturnNullWhenMovieMissing()
    {
        await using var context = CreateContext();
        var operations = new MovieOperations(context);

        var deleted = await operations.DeleteMovieAsync(Guid.NewGuid());

        deleted.ShouldBeNull();
    }

    [Fact]
    public async Task UpdateMovieAsync_ShouldApplyChangesWhenMovieExists()
    {
        await using var context = CreateContext();
        var movie = CreateExistingMovie();
        await context.Movies.AddAsync(movie);
        await context.SaveChangesAsync();
        var originalUpdatedAt = movie.UpdatedAt;
        var operations = new MovieOperations(context);
        var updateDto = new UpdateMovieDto
        {
            Title = "The Matrix Reloaded",
            Description = "More questions than answers",
            Rating = Rating.PG13,
            ReleaseDate = DateTime.UtcNow.AddYears(-18)
        };

        var updated = await operations.UpdateMovieAsync(movie.Id, updateDto);

        updated.ShouldNotBeNull();
        updated.Id.ShouldBe(movie.Id);
        updated.Title.ShouldBe(updateDto.Title);
        updated.Description.ShouldBe(updateDto.Description);
        updated.Rating.ShouldBe(updateDto.Rating);
        updated.ReleaseDate.ShouldBe(updateDto.ReleaseDate);
        updated.UpdatedAt.ShouldBeGreaterThan(originalUpdatedAt);
        updated.UpdatedAt.Kind.ShouldBe(DateTimeKind.Utc);
    }

    [Fact]
    public async Task UpdateMovieAsync_ShouldReturnNullWhenMovieMissing()
    {
        await using var context = CreateContext();
        var operations = new MovieOperations(context);
        var updateDto = new UpdateMovieDto
        {
            Title = "Nonexistent",
            Description = "Does not exist",
            Rating = Rating.G,
            ReleaseDate = DateTime.UtcNow.AddYears(-1)
        };

        var updated = await operations.UpdateMovieAsync(Guid.NewGuid(), updateDto);

        updated.ShouldBeNull();
    }

    [Fact]
    public async Task GetMovieAsync_ShouldReturnMovieWhenExists()
    {
        await using var context = CreateContext();
        var movie = CreateExistingMovie();
        await context.Movies.AddAsync(movie);
        await context.SaveChangesAsync();
        var operations = new MovieOperations(context);

        var result = await operations.GetMovieAsync(movie.Id);

        result.ShouldNotBeNull();
        result.Id.ShouldBe(movie.Id);
    }

    [Fact]
    public async Task GetMovieAsync_ShouldReturnNullWhenMissing()
    {
        await using var context = CreateContext();
        var operations = new MovieOperations(context);

        var result = await operations.GetMovieAsync(Guid.NewGuid());

        result.ShouldBeNull();
    }

    [Fact]
    public async Task GetMoviesAsync_ShouldReturnAllMovies()
    {
        await using var context = CreateContext();
        var movies = new[]
        {
            CreateExistingMovie(Guid.NewGuid()),
            CreateExistingMovie(Guid.NewGuid())
        };
        await context.Movies.AddRangeAsync(movies);
        await context.SaveChangesAsync();
        var operations = new MovieOperations(context);

        var result = (await operations.GetMoviesAsync()).ToArray();

        result.Length.ShouldBe(movies.Length);
        result.Select(m => m.Id).ShouldBeEquivalentTo(movies.Select(m => m.Id));
    }
}
