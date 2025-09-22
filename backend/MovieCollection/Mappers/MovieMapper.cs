using MovieCollection.Data.DTOs;
using MovieCollection.Data.Models;
using Riok.Mapperly.Abstractions;

namespace MovieCollection.Mappers;

[Mapper(EnumMappingStrategy = EnumMappingStrategy.ByName)]
public partial class MovieMapper
{
    [MapperIgnoreSource(nameof(Movie.Id))]
    [MapperIgnoreSource(nameof(Movie.CreatedAt))]
    [MapperIgnoreSource(nameof(Movie.UpdatedAt))]
    public partial NewMovieDto MovieToNewMovieDto(Movie movie);

    [MapperIgnoreSource(nameof(Movie.Id))]
    [MapperIgnoreSource(nameof(Movie.CreatedAt))]
    [MapperIgnoreSource(nameof(Movie.UpdatedAt))]
    public partial UpdateMovieDto MovieToUpdateMovieDto(Movie movie);

    [MapperIgnoreTarget(nameof(Movie.Id))]
    [MapperIgnoreTarget(nameof(Movie.CreatedAt))]
    [MapperIgnoreTarget(nameof(Movie.UpdatedAt))]
    public partial Movie NewMovieDtoToMovie(NewMovieDto movie);

    [MapperIgnoreTarget(nameof(Movie.Id))]
    [MapperIgnoreTarget(nameof(Movie.CreatedAt))]
    [MapperIgnoreTarget(nameof(Movie.UpdatedAt))]
    public partial void UpdateMovieFromDto(UpdateMovieDto dto, Movie movie);
}