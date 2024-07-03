using MovieCollection.Components;
using MovieCollection.Data.DTOs;
using MovieCollection.Operations;
using static Microsoft.AspNetCore.Http.TypedResults;

namespace MovieCollection.Routers;

public class MovieRouter : RouterBase
{
    private readonly IMovieOperations _operations;

    public MovieRouter(IMovieOperations operations)
    {
        UrlFragment = "movies";
        _operations = operations;
    }

    public override void AddRoutes(WebApplication app)
    {
        app.MapGet($"/{UrlFragment}", () => GetAllMovies());
        app.MapGet($"/{UrlFragment}/{{id:guid}}", (Guid id) => GetMovie(id));
        app.MapPost($"/{UrlFragment}", (NewMovieDto newMovie) => AddMovie(newMovie));
        app.MapPut(
            $"/{UrlFragment}/{{id:guid}}",
            (Guid id, UpdateMovieDto updatedMovie) => UpdateMovie(id, updatedMovie)
        );
        app.MapDelete($"/{UrlFragment}/{{id:guid}}", (Guid id) => DeleteMovie(id));
    }

    protected async virtual Task<IResult> GetMovie(Guid id)
    {
        return Ok(await _operations.GetMovieAsync(id));
    }

    protected async virtual Task<IResult> GetAllMovies()
    {
        return Ok(await _operations.GetMoviesAsync());
    }

    protected async virtual Task<IResult> AddMovie(NewMovieDto newMovie)
    {
        var validator = new NewMovieDtoValidator();
        var result = await validator.ValidateAsync(newMovie);

        if (!result.IsValid)
            return ValidationProblem(result.ToDictionary());

        var movie = await _operations.AddMovieAsync(newMovie);

        return Created($"/movies/{movie.Id}", movie);
    }

    protected async virtual Task<IResult> UpdateMovie(Guid id, UpdateMovieDto updatedMovie)
    {
        var validator = new UpdateMovieDtoValidator();
        var result = await validator.ValidateAsync(updatedMovie);

        if (!result.IsValid)
            return ValidationProblem(result.ToDictionary());

        var movie = await _operations.UpdateMovieAsync(id, updatedMovie);

        return movie is not null ? NoContent() : NotFound();
    }

    protected async virtual Task<IResult> DeleteMovie(Guid id)
    {
        var deletedMovie = await _operations.DeleteMovieAsync(id);

        return deletedMovie is not null ? Ok(deletedMovie) : NotFound();
    }
}
