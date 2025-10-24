using FluentValidation;
using MovieCollection.Data.Models;

namespace MovieCollection.Data.DTOs;

public class UpdateMovieDto
{
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public Rating Rating { get; set; }
    public DateTime ReleaseDate { get; set; }
}

public class UpdateMovieDtoValidator : AbstractValidator<UpdateMovieDto>
{
    public UpdateMovieDtoValidator()
    {
        RuleFor(n => n.Title)
            .NotEmpty();
        RuleFor(n => n.Description)
            .NotEmpty()
            .MaximumLength(250)
            .NotEqual(n => n.Title)
                .WithMessage("Description must be different from Title.");
        RuleFor(n => n.Rating)
            .NotEmpty()
            .IsInEnum();
        RuleFor(n => n.ReleaseDate)
            .NotEmpty()
            .LessThanOrEqualTo(DateTime.UtcNow);
    }
}
