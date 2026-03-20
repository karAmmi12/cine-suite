using CineSuite.Server.Hubs;

var builder = WebApplication.CreateBuilder(args);

// ===== CONFIGURATION DU SERVEUR =====
// Écoute sur 0.0.0.0:5000 pour être accessible sur le réseau local
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5001); // Accessible depuis n'importe quelle interface réseau
});

// ===== SERVICES =====
// CORS : Autorise toutes les origines (développement local + appareils mobiles)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Requis pour SignalR
    });
});

// SignalR pour la communication temps réel
builder.Services.AddSignalR();

// Controllers pour les API REST
builder.Services.AddControllers();

// OpenAPI/Swagger pour la documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ===== MIDDLEWARE =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Active CORS (doit être avant UseRouting)
app.UseCors("AllowAll");

// Servir les fichiers statiques (React build)
// En production (Electron), on sert le dist pour permettre l'accès depuis mobile
string distPath;
if (app.Environment.IsDevelopment())
{
    // En dev: chercher dist à la racine du workspace
    distPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "dist");
}
else
{
    // En production (packagé): dist est dans Resources/dist (2 niveaux au-dessus du serveur)
    // server/osx-arm64 -> server -> Resources -> dist
    distPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "dist");
}

if (Directory.Exists(distPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(distPath),
        RequestPath = ""
    });
    
    // Fallback pour React Router (SPA)
    app.MapFallbackToFile("index.html", new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(distPath)
    });
    
    Console.WriteLine($"📁 Serving static files from: {distPath}");
}
else
{
    Console.WriteLine($"⚠️  Static files directory not found: {distPath}");
}

// Route les controllers et SignalR
app.UseRouting();

app.MapControllers();
app.MapHub<CinemaHub>("/hub/cinema"); // SignalR Hub accessible sur /hub/cinema

// Message de démarrage
app.Lifetime.ApplicationStarted.Register(() =>
{
    Console.WriteLine("═══════════════════════════════════════════════════");
    Console.WriteLine("🎬 CineSuite Server Started!");
    Console.WriteLine($"📡 Listening on: http://0.0.0.0:5001");
    Console.WriteLine($"🔌 SignalR Hub: http://0.0.0.0:5001/hub/cinema");
    Console.WriteLine($"📱 API Endpoint: http://0.0.0.0:5001/api/network/ip");
    Console.WriteLine($"🌍 Environment: {app.Environment.EnvironmentName}");
    Console.WriteLine("═══════════════════════════════════════════════════");
});

app.Run();
