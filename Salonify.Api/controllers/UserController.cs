using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Salonify.Api.Controllers;

[ApiController]
[Route("api/user")]
public class UserController : ControllerBase
{
    private readonly UserRepository _userRepository;

    public UserController(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [Authorize(Roles = "User,Admin")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nedostaje UserId u tokenu." });

        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            return NotFound(new { message = "Korisnik nije pronadjen." });

        return Ok(new
        {
            user.Id,
            user.Email,
            user.DisplayName,
            user.Phone,
            Role = user.Role.ToString(),
            user.CreatedAt
        });
    }

    [Authorize(Roles = "User,Admin")]
    [HttpPut("contact")]
    public async Task<IActionResult> UpdateContact([FromBody] UpdateUserContactRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nedostaje UserId u tokenu." });

        if (string.IsNullOrWhiteSpace(request.DisplayName))
            return BadRequest(new { message = "Ime je obavezno." });

        await _userRepository.UpdateContactAsync(
            userId,
            request.DisplayName.Trim(),
            request.Phone?.Trim() ?? string.Empty
        );

        var user = await _userRepository.GetByIdAsync(userId);

        return Ok(new
        {
            user!.Id,
            user.Email,
            user.DisplayName,
            user.Phone,
            Role = user.Role.ToString(),
            user.CreatedAt
        });
    }
}
