using Microsoft.AspNetCore.Identity;

namespace Salonify.Api.Services;

public static class AdminSeedService
{
    public static async Task SeedAdminAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var userRepository = scope.ServiceProvider.GetRequiredService<UserRepository>();

        var email = configuration["Admin:Email"];
        var password = configuration["Admin:Password"];
        var displayName = configuration["Admin:DisplayName"] ?? "Admin";
        var phone = configuration["Admin:Phone"] ?? string.Empty;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            Console.WriteLine("[AdminSeed] Admin nalog nije kreiran jer Admin:Email ili Admin:Password nisu podeseni.");
            return;
        }

        var existingAdmin = await userRepository.GetByEmailAsync(email);

        if (existingAdmin != null)
        {
            Console.WriteLine($"[AdminSeed] Admin nalog vec postoji: {email}");
            return;
        }

        var admin = new User
        {
            Email = email,
            DisplayName = displayName,
            Phone = phone,
            Role = UserRole.Admin,
            PreferenceVector = new Dictionary<string, double>()
        };

        var passwordHasher = new PasswordHasher<User>();
        admin.PasswordHash = passwordHasher.HashPassword(admin, password);

        await userRepository.CreateAsync(admin);

        Console.WriteLine($"[AdminSeed] Admin nalog je kreiran: {email}");
    }
}
