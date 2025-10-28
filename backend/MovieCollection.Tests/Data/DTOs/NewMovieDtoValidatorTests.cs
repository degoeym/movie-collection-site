using MovieCollection.Data.DTOs;
using MovieCollection.Data.Models;
using Shouldly;

namespace MovieCollection.Tests.Data.DTOs;

public class NewMovieDtoValidatorTests
{
    private readonly NewMovieDtoValidator _validator = new();

    private static NewMovieDto CreateValidDto() => new()
    {
        Title = "Arrival",
        Description = "First contact",
        Rating = Rating.PG13,
        ReleaseDate = DateTime.UtcNow.AddYears(-7)
    };

    [Fact]
    public async Task Validate_ShouldSucceed_ForValidDto()
    {
        var dto = CreateValidDto();

        var result = await _validator.ValidateAsync(dto);

        result.IsValid.ShouldBeTrue();
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenTitleEmpty()
    {
        var dto = CreateValidDto();
        dto.Title = string.Empty;

        var result = await _validator.ValidateAsync(dto);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(NewMovieDto.Title));
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenDescriptionEmpty()
    {
        var dto = CreateValidDto();
        dto.Description = string.Empty;

        var result = await _validator.ValidateAsync(dto);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(NewMovieDto.Description));
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenDescriptionMatchesTitle()
    {
        var dto = CreateValidDto();
        dto.Description = dto.Title;

        var result = await _validator.ValidateAsync(dto);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(NewMovieDto.Description));
        result.Errors.ShouldContain(e => e.ErrorMessage.Contains("Description must be different from Title."));
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenDescriptionTooLong()
    {
        var dto = CreateValidDto();
        dto.Description = new string('x', 251);

        var result = await _validator.ValidateAsync(dto);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(NewMovieDto.Description));
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenRatingIsDefault()
    {
        var dto = CreateValidDto();
        dto.Rating = (Rating)0;

        var result = await _validator.ValidateAsync(dto);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(NewMovieDto.Rating));
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenReleaseDateInFuture()
    {
        var dto = CreateValidDto();
        dto.ReleaseDate = DateTime.UtcNow.AddDays(1);

        var result = await _validator.ValidateAsync(dto);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(NewMovieDto.ReleaseDate));
    }

    [Fact]
    public async Task Validate_ShouldFail_WhenReleaseDateDefault()
    {
        var dto = CreateValidDto();
        dto.ReleaseDate = default;

        var result = await _validator.ValidateAsync(dto);

        result.IsValid.ShouldBeFalse();
        result.Errors.ShouldContain(e => e.PropertyName == nameof(NewMovieDto.ReleaseDate));
    }

    [Fact]
    public async Task Validate_ShouldAllow_ReleaseDateEqualNow()
    {
        var dto = CreateValidDto();
        dto.ReleaseDate = DateTime.UtcNow;

        var result = await _validator.ValidateAsync(dto);

        result.IsValid.ShouldBeTrue();
    }
}
