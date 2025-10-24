using System.Runtime.Serialization;

namespace MovieCollection.Data.Models;

public record Movie
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public Rating Rating { get; set; }
    public DateTime ReleaseDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public enum Rating
{
    [EnumMember(Value = "N/R")]
    Unknown = -1,
    G = 1,
    PG = 2,

    [EnumMember(Value = "PG-13")]
    PG13 = 3,
    R = 4,

    [EnumMember(Value = "NC-17")]
    NC17 = 5,
    X = 6,
}
