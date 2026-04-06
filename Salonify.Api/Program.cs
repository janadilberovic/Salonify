
using Microsoft.OpenApi.Models;
using Salonify.Api.Services;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Salonify.Api.Repositories;
using System.Security.Claims;

WebApplicationBuilder webApplicationBuilder = WebApplication.CreateBuilder(args);

var builder = webApplicationBuilder;

// ===== SERVICES =====
builder.Services.AddSingleton<MongoDbContext>();

builder.Services.AddEndpointsApiExplorer();


   builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)
            ),
             RoleClaimType = ClaimTypes.Role
        };
    });
    builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Salonify API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Unesi: Bearer {JWT token}"
    });

   c.AddSecurityRequirement(new OpenApiSecurityRequirement
{
    {
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        },
        Array.Empty<string>()
    }
});
});
builder.Services.AddAuthorization();

builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<SalonRepository>();
builder.Services.AddScoped<AppointmentRepository>();
builder.Services.AddScoped<ReviewRepository>();

builder.Services.AddScoped<JwtService>();
builder.Services.AddControllers();


// ===== APP =====
var app = builder.Build();

// ===== MIDDLEWARE =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Salonify API v1");
    });
}
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseHttpsRedirection();

// ===== TEST ENDPOINT =====


app.Run();

