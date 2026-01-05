var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// CORS for React dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactDevPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("ReactDevPolicy");
app.MapControllers();

// Force backend to run on a fixed port
var port = 5180;
app.Urls.Clear();
app.Urls.Add($"http://127.0.0.1:{port}");

app.Logger.LogInformation("Backend starting on port {Port}", port);
app.Run();