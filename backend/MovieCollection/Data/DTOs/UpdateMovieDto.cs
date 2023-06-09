﻿using FluentValidation;
using MovieCollection.Data.Models;

namespace MovieCollection.Data.DTOs;

public class UpdateMovieDto
{
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
    public Rating Rating { get; set; }
    public DateTime ReleaseDate { get; set; }

    public UpdateMovieDto() { }
}

public class UpdateMovieDtoValidator : AbstractValidator<UpdateMovieDto>
{
    public UpdateMovieDtoValidator()
    {
        RuleFor(n => n.Title).NotEmpty();
        RuleFor(n => n.Description).NotEmpty().MaximumLength(250).NotEqual(n => n.Title);
        RuleFor(n => n.Rating).NotEmpty();
        RuleFor(n => n.ReleaseDate).NotEmpty();
    }
}
