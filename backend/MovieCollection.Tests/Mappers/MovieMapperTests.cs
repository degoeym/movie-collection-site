using MovieCollection.Data.DTOs;
using MovieCollection.Data.Models;
using MovieCollection.Mappers;
using Shouldly;

namespace MovieCollection.Tests.Mappers;

public class MovieMapperTests
{
    private readonly MovieMapper _mapper = new();

    private static Movie CreateMovie() => new()
    {
        Id = Guid.NewGuid(),
        Title = "Dune",
        Description = "Fear is the mind-killer",
        Rating = Rating.PG13,
        ReleaseDate = DateTime.UtcNow.AddYears(-2),
        CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-10), DateTimeKind.Utc),
        UpdatedAt = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(-5), DateTimeKind.Utc)
    };

    private static NewMovieDto CreateNewMovieDto() => new()
    {
        Title = "The Prestige",
        Description = "Are you watching closely?",
        Rating = Rating.PG13,
        ReleaseDate = DateTime.UtcNow.AddYears(-18)
    };

    private static UpdateMovieDto CreateUpdateMovieDto() => new()
    {
        Title = "Memento",
        Description = "A man with short-term memory loss",
        Rating = Rating.R,
        ReleaseDate = DateTime.UtcNow.AddYears(-25)
    };

    [Fact]
    public void MovieToNewMovieDto_ShouldMapBasicFields()
    {
        var movie = CreateMovie();

        var dto = _mapper.MovieToNewMovieDto(movie);

        dto.Title.ShouldBe(movie.Title);
        dto.Description.ShouldBe(movie.Description);
        dto.Rating.ShouldBe(movie.Rating);
        dto.ReleaseDate.ShouldBe(movie.ReleaseDate);
    }

    [Fact]
    public void MovieToUpdateMovieDto_ShouldMapBasicFields()
    {
        var movie = CreateMovie();

        var dto = _mapper.MovieToUpdateMovieDto(movie);

        dto.Title.ShouldBe(movie.Title);
        dto.Description.ShouldBe(movie.Description);
        dto.Rating.ShouldBe(movie.Rating);
        dto.ReleaseDate.ShouldBe(movie.ReleaseDate);
    }

    [Fact]
    public void NewMovieDtoToMovie_ShouldAssignFieldsAndLeaveIdentifiersDefault()
    {
        var dto = CreateNewMovieDto();

        var movie = _mapper.NewMovieDtoToMovie(dto);

        movie.Id.ShouldBe(Guid.Empty);
        movie.CreatedAt.ShouldBe(default);
        movie.UpdatedAt.ShouldBe(default);
        movie.Title.ShouldBe(dto.Title);
        movie.Description.ShouldBe(dto.Description);
        movie.Rating.ShouldBe(dto.Rating);
        movie.ReleaseDate.ShouldBe(dto.ReleaseDate);
    }

    [Fact]
    public void UpdateMovieFromDto_ShouldModifyFieldsWithoutTouchingIdentifiers()
    {
        var source = CreateMovie();
        var originalId = source.Id;
        var originalCreated = source.CreatedAt;
        var originalUpdated = source.UpdatedAt;
        var dto = CreateUpdateMovieDto();

        _mapper.UpdateMovieFromDto(dto, source);

        source.Id.ShouldBe(originalId);
        source.CreatedAt.ShouldBe(originalCreated);
        source.UpdatedAt.ShouldBe(originalUpdated);
        source.Title.ShouldBe(dto.Title);
        source.Description.ShouldBe(dto.Description);
        source.Rating.ShouldBe(dto.Rating);
        source.ReleaseDate.ShouldBe(dto.ReleaseDate);
    }
}
