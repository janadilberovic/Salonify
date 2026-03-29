using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salonify.Api.Repositories;
using System.Security.Claims;

namespace Salonify.Api.Controllers;

[ApiController]
[Route("api/salon")]
public class SalonController : ControllerBase
{
    private readonly SalonRepository _salonRepository;

    public SalonController(SalonRepository salonRepository)
    {
        _salonRepository = salonRepository;
    }

    [Authorize(Roles = "Salon")]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { error = "Salon profil nije pronađen." });

        return Ok(salon);
    }
    [Authorize(Roles = "Salon")]
    [HttpPut("update-profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateSalonProfileRequest updateRequest)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { error = "Salon profil nije pronađen." });

        await _salonRepository.UpdateSalonProfileAsync(userId, updateRequest);

        return NoContent();
    }
    [Authorize(Roles = "Salon")]
    [HttpPut("update-image")]
    public async Task<IActionResult> UpdateImage(IFormFile file)
    {
         if (file == null || file.Length == 0)
        return BadRequest("Fajl nije prosleđen.");

    var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
    var ext = Path.GetExtension(file.FileName).ToLower();

    if (!allowedExtensions.Contains(ext))
        return BadRequest("Dozvoljeni su samo JPG i PNG fajlovi.");

    var fileName = $"{Guid.NewGuid()}{ext}";
    var path = Path.Combine("wwwroot/uploads/salons", fileName);

    Directory.CreateDirectory("wwwroot/uploads/salons");

    using (var stream = new FileStream(path, FileMode.Create))
    {
        await file.CopyToAsync(stream);
    }

    var imageUrl = $"/uploads/salons/{fileName}";

    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    await _salonRepository.UpdateImageAsync(userId, imageUrl);

    return Ok(new { imageUrl });
    }
    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var salons = await _salonRepository.GetAllAsync();
        return Ok(salons);
    }
}
//treba da pogledam ovo gde hvata sve salone 