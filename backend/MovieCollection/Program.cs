using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;
using MovieCollection.Components;
using MovieCollection.Data;
using MovieCollection.Operations;
using MovieCollection.Routers;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<MovieCollectionContext>(
    opt => opt.UseNpgsql(connectionString).UseSnakeCaseNamingConvention()
);
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddScoped<IMovieOperations, MovieOperations>();
builder.Services.AddScoped<RouterBase, MovieRouter>();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.Configure<JsonOptions>(
    opt => opt.SerializerOptions.Converters.Add(new JsonStringEnumConverter())
);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MovieCollectionContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider.GetServices<RouterBase>();

    foreach (var service in services)
    {
        service.AddRoutes(app);
    }

    app.Run();
}
