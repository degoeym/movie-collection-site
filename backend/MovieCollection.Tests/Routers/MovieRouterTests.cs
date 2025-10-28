using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Moq;
using MovieCollection.Data.DTOs;
using MovieCollection.Data.Models;
using MovieCollection.Operations;
using MovieCollection.Routers;
using Shouldly;

namespace MovieCollection.Tests.Routers;

public class MovieRouterTests
{
    private static NewMovieDto CreateValidNewMovieDto() => new()
    {
        Title = "Tenet",
        Description = "Time inversion thriller",
        Rating = Rating.PG13,
        ReleaseDate = DateTime.UtcNow.AddYears(-1)
    };

    private static UpdateMovieDto CreateValidUpdateMovieDto() => new()
    {
        Title = "Interstellar",
        Description = "A journey through space and time",
        Rating = Rating.PG13,
        ReleaseDate = DateTime.UtcNow.AddYears(-5)
    };

    private sealed class TestableMovieRouter : MovieRouter
    {
        public TestableMovieRouter(IMovieOperations operations) : base(operations) { }

        public Task<IResult> InvokeGetMovie(Guid id) => GetMovie(id);
        public Task<IResult> InvokeGetAllMovies() => GetAllMovies();
        public Task<IResult> InvokeAddMovie(NewMovieDto dto) => AddMovie(dto);
        public Task<IResult> InvokeUpdateMovie(Guid id, UpdateMovieDto dto) => UpdateMovie(id, dto);
        public Task<IResult> InvokeDeleteMovie(Guid id) => DeleteMovie(id);
    }

    [Fact]
    public async Task GetMovie_ShouldReturnOkWhenMovieFound()
    {
        var movieId = Guid.NewGuid();
        var movie = new Movie { Id = movieId };
        var operations = new Mock<IMovieOperations>();
        operations.Setup(o => o.GetMovieAsync(movieId)).ReturnsAsync(movie);
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeGetMovie(movieId);

        var ok = result.ShouldBeOfType<Ok<Movie>>();
        ok.Value.ShouldBe(movie);
        operations.Verify(o => o.GetMovieAsync(movieId), Times.Once);
    }

    [Fact]
    public async Task GetMovie_ShouldReturnNotFoundWhenMissing()
    {
        var movieId = Guid.NewGuid();
        var operations = new Mock<IMovieOperations>();
        operations.Setup(o => o.GetMovieAsync(movieId)).ReturnsAsync((Movie?)null);
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeGetMovie(movieId);

        result.ShouldBeOfType<NotFound>();
        operations.Verify(o => o.GetMovieAsync(movieId), Times.Once);
    }

    [Fact]
    public async Task GetAllMovies_ShouldReturnOkWithPayload()
    {
        var movies = new[] { new Movie(), new Movie() };
        var operations = new Mock<IMovieOperations>();
        operations.Setup(o => o.GetMoviesAsync()).ReturnsAsync(movies);
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeGetAllMovies();

        var ok = result.ShouldBeOfType<Ok<IEnumerable<Movie>>>();
        ok.Value.ShouldBe(movies);
        operations.Verify(o => o.GetMoviesAsync(), Times.Once);
    }

    [Fact]
    public async Task AddMovie_ShouldReturnCreatedWhenValid()
    {
        var dto = CreateValidNewMovieDto();
        var createdMovie = new Movie
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Rating = dto.Rating,
            ReleaseDate = dto.ReleaseDate
        };
        var operations = new Mock<IMovieOperations>();
        operations.Setup(o => o.AddMovieAsync(dto)).ReturnsAsync(createdMovie);
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeAddMovie(dto);

        var created = result.ShouldBeOfType<Created<Movie>>();
        created.Value.ShouldBe(createdMovie);
        created.Location.ShouldBe($"/movies/{createdMovie.Id}");
        operations.Verify(o => o.AddMovieAsync(dto), Times.Once);
    }

    [Fact]
    public async Task AddMovie_ShouldReturnValidationProblemWhenInvalid()
    {
        var dto = CreateValidNewMovieDto();
        dto.Title = string.Empty;
        var operations = new Mock<IMovieOperations>();
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeAddMovie(dto);

        var problem = result.ShouldBeOfType<ValidationProblem>();
        problem.ProblemDetails.Errors.ShouldContainKey(nameof(NewMovieDto.Title));
        operations.Verify(o => o.AddMovieAsync(It.IsAny<NewMovieDto>()), Times.Never);
    }

    [Fact]
    public async Task UpdateMovie_ShouldReturnNoContentWhenSuccessful()
    {
        var movieId = Guid.NewGuid();
        var dto = CreateValidUpdateMovieDto();
        var operations = new Mock<IMovieOperations>();
        operations.Setup(o => o.UpdateMovieAsync(movieId, dto)).ReturnsAsync(new Movie { Id = movieId });
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeUpdateMovie(movieId, dto);

        result.ShouldBeOfType<NoContent>();
        operations.Verify(o => o.UpdateMovieAsync(movieId, dto), Times.Once);
    }

    [Fact]
    public async Task UpdateMovie_ShouldReturnNotFoundWhenMissing()
    {
        var movieId = Guid.NewGuid();
        var dto = CreateValidUpdateMovieDto();
        var operations = new Mock<IMovieOperations>();
        operations.Setup(o => o.UpdateMovieAsync(movieId, dto)).ReturnsAsync((Movie?)null);
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeUpdateMovie(movieId, dto);

        result.ShouldBeOfType<NotFound>();
        operations.Verify(o => o.UpdateMovieAsync(movieId, dto), Times.Once);
    }

    [Fact]
    public async Task UpdateMovie_ShouldReturnValidationProblemWhenInvalid()
    {
        var movieId = Guid.NewGuid();
        var dto = CreateValidUpdateMovieDto();
        dto.Description = new string('x', 260);
        var operations = new Mock<IMovieOperations>();
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeUpdateMovie(movieId, dto);

        var problem = result.ShouldBeOfType<ValidationProblem>();
        problem.ProblemDetails.Errors.ShouldContainKey(nameof(UpdateMovieDto.Description));
        operations.Verify(o => o.UpdateMovieAsync(It.IsAny<Guid>(), It.IsAny<UpdateMovieDto>()), Times.Never);
    }

    [Fact]
    public async Task UpdateMovie_ShouldReturnProblemWhenOperationThrows()
    {
        var movieId = Guid.NewGuid();
        var dto = CreateValidUpdateMovieDto();
        var operations = new Mock<IMovieOperations>();
        operations.Setup(o => o.UpdateMovieAsync(movieId, dto)).ThrowsAsync(new InvalidOperationException("db error"));
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeUpdateMovie(movieId, dto);

        var problem = result.ShouldBeOfType<ProblemHttpResult>();
        problem.ProblemDetails.Status.ShouldBe(StatusCodes.Status500InternalServerError);
        problem.ProblemDetails.Detail.ShouldBe("An error occurred while updating the movie.");
        operations.Verify(o => o.UpdateMovieAsync(movieId, dto), Times.Once);
    }

    [Fact]
    public async Task DeleteMovie_ShouldReturnOkWhenDeleted()
    {
        var movieId = Guid.NewGuid();
        var movie = new Movie { Id = movieId };
        var operations = new Mock<IMovieOperations>();
        operations.Setup(o => o.DeleteMovieAsync(movieId)).ReturnsAsync(movie);
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeDeleteMovie(movieId);

        var ok = result.ShouldBeOfType<Ok<Movie>>();
        ok.Value.ShouldBe(movie);
        operations.Verify(o => o.DeleteMovieAsync(movieId), Times.Once);
    }

    [Fact]
    public async Task DeleteMovie_ShouldReturnNotFoundWhenMissing()
    {
        var movieId = Guid.NewGuid();
        var operations = new Mock<IMovieOperations>();
        operations.Setup(o => o.DeleteMovieAsync(movieId)).ReturnsAsync((Movie?)null);
        var router = new TestableMovieRouter(operations.Object);

        var result = await router.InvokeDeleteMovie(movieId);

        result.ShouldBeOfType<NotFound>();
        operations.Verify(o => o.DeleteMovieAsync(movieId), Times.Once);
    }
}
