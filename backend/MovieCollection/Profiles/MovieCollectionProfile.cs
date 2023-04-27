using AutoMapper;
using MovieCollection.Data.DTOs;
using MovieCollection.Data.Models;

namespace MovieCollection.Profiles;

public class MovieCollectionProfile : Profile
{
    public MovieCollectionProfile()
    {
        CreateMap<NewMovieDto, Movie>()
            .AfterMap(
                (src, dest) =>
                {
                    dest.ReleaseDate = DateTime.SpecifyKind(src.ReleaseDate, DateTimeKind.Utc);
                }
            );

        CreateMap<UpdateMovieDto, Movie>()
            .AfterMap(
                (src, dest) =>
                {
                    dest.ReleaseDate = DateTime.SpecifyKind(src.ReleaseDate, DateTimeKind.Utc);
                }
            );
    }
}
