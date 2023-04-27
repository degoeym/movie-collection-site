using Microsoft.EntityFrameworkCore;
using MovieCollection.Data.Models;

namespace MovieCollection.Data;

public class MovieCollectionContext : DbContext
{
    public MovieCollectionContext(DbContextOptions<MovieCollectionContext> options)
        : base(options) { }

    public DbSet<Movie> Movies => Set<Movie>();
}
