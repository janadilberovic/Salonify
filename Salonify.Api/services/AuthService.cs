using Microsoft.AspNetCore.Identity;

public class AuthService
{
    private readonly UserRepository _userRepository;
    private readonly MongoDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthService(UserRepository userRepository, MongoDbContext context)
    {
        _userRepository = userRepository;
        _context = context;
        _passwordHasher = new PasswordHasher<User>();
    }

    // REGISTRACIJA
    public async Task RegisterAsync(RegisterRequest request)
    {

        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
            throw new Exception("Email je već u upotrebi.");


        var user = new User
        {
            Email = request.Email,
            Role = request.Role,
            DisplayName = request.DisplayName,
            Phone=request.Phone
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        await _userRepository.CreateAsync(user);
        
        if (request.Role == UserRole.Salon)
        {
            var baseSlug = SlugHelper.GenerateSlug(request.DisplayName);
            var salon = new Salon
            {

                UserId = user.Id,
                Name = request.DisplayName,
                Slug = $"{baseSlug}-{Guid.NewGuid().ToString("N")[..6]}",
                Description = request.SalonDescription ?? "",

            };

            await _context.Salons.InsertOneAsync(salon);
        }
    }


    public async Task<User> LoginAsync(LoginRequest request)
    {

        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
            throw new Exception("Pogrešan email ili lozinka.");


        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (result == PasswordVerificationResult.Failed)
            throw new Exception("Pogrešan email ili lozinka.");

        return user;
    }
}
