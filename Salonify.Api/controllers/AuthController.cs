using Microsoft.AspNetCore.Mvc;
using Salonify.Api.Services;
namespace Salonify.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly JwtService _jwtService;

    public AuthController(AuthService authService, JwtService jwtService)
    {
        _authService = authService;
        _jwtService = jwtService;
    }

    // =========================
    // REGISTER
    // =========================
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        await _authService.RegisterAsync(request);

        return Ok(new
        {
            message = "Uspešna registracija"
        });
    }

    // =========================
    // LOGIN
    // =========================
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _authService.LoginAsync(request);

        var token = _jwtService.GenerateToken(user);

        var response = new AuthResponse
        {
            Token = token,
            Role = user.Role.ToString(),
            DisplayName = user.DisplayName
        };

        return Ok(response);
    }
}
