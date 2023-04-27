namespace MovieCollection.Components;

public class RouterBase
{
    public string? UrlFragment;

    public virtual void AddRoutes(WebApplication app) { }
}
