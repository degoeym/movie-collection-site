using FluentValidation;
using MovieCollection.Data.Models;

namespace MovieCollection.Data.DTOs;

public record NewMovieDto
{
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public Rating Rating { get; set; }
    public DateTime ReleaseDate { get; set; }

    public NewMovieDto() { }
}

public class NewMovieDtoValidator : AbstractValidator<NewMovieDto>
{
    public NewMovieDtoValidator()
    {
        RuleFor(n => n.Title).NotEmpty();
        RuleFor(n => n.Description).NotEmpty().MaximumLength(250).NotEqual(n => n.Title);
        RuleFor(n => n.Rating).NotEmpty();
        RuleFor(n => n.ReleaseDate).NotEmpty();
    }
}
