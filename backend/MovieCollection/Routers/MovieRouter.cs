using MovieCollection.Components;
using MovieCollection.Data.DTOs;
using MovieCollection.Operations;

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
        app.MapGet($"/{UrlFragment}", GetAllMovies);
        app.MapGet($"/{UrlFragment}/{{id:guid}}", GetMovie);
        app.MapPost($"/{UrlFragment}", AddMovie);
        app.MapPut(
            $"/{UrlFragment}/{{id:guid}}",
            UpdateMovie
        );
        app.MapDelete($"/{UrlFragment}/{{id:guid}}", DeleteMovie);
    }

    protected async virtual Task<IResult> GetMovie(Guid id)
    {
        var movie = await _operations.GetMovieAsync(id);

        return movie is not null
            ? TypedResults.Ok(movie)
            : TypedResults.NotFound();
    }

    protected async virtual Task<IResult> GetAllMovies()
    {
        return TypedResults.Ok(await _operations.GetMoviesAsync());
    }

    protected async virtual Task<IResult> AddMovie(NewMovieDto newMovie)
    {
        var validator = new NewMovieDtoValidator();
        var result = await validator.ValidateAsync(newMovie);

        if (!result.IsValid)
            return TypedResults.ValidationProblem(result.ToDictionary());

        var movie = await _operations.AddMovieAsync(newMovie);

        return TypedResults.Created($"/movies/{movie.Id}", movie);
    }

    protected async virtual Task<IResult> UpdateMovie(Guid id, UpdateMovieDto updatedMovie)
    {
        var validator = new UpdateMovieDtoValidator();
        var result = await validator.ValidateAsync(updatedMovie);

        if (!result.IsValid)
            return TypedResults.ValidationProblem(result.ToDictionary());

        try
        {
            var movie = await _operations.UpdateMovieAsync(id, updatedMovie);
            return movie is not null
                ? TypedResults.NoContent()
                : TypedResults.NotFound();
        }
        catch
        {
            // Do not leak internal details; return a generic server error.
            return TypedResults.Problem("An error occurred while updating the movie.", statusCode: 500);
        }
    }

    protected async virtual Task<IResult> DeleteMovie(Guid id)
    {
        var deletedMovie = await _operations.DeleteMovieAsync(id);

        return deletedMovie is not null
            ? TypedResults.Ok(deletedMovie)
            : TypedResults.NotFound();
    }
}
