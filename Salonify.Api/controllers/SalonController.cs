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
    [HttpGet("get-salon-id-by-user")]
    public async Task<IActionResult> GetSalonIdByUser([FromQuery] string userId)
    {
        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { message = "Salon nije pronađen." });

        return Ok(new { salonId = salon.Id });
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
    [HttpPut("update-working-days")]
    public async Task<IActionResult> UpdateWorkingDays([FromBody] UpdateSalonWorkingDaysDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { error = "Salon profil nije pronađen." });
        await _salonRepository.UpdateSalonWorkingDays(userId, dto);
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
    [Authorize(Roles = "Salon")]
    [HttpGet("my-services")]
    public async Task<IActionResult> GetMyServices()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { error = "Salon nije pronađen." });

        return Ok(salon.Services);
    }

    [Authorize(Roles = "Salon")]
    [HttpPost("add-service")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> AddService([FromForm] SalonServiceReq request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { error = "Salon profil nije pronađen." });

        string? imageUrl = null;

        if (request.Image != null && request.Image.Length > 0)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Image.FileName)}";
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "services");
            Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.Image.CopyToAsync(stream);
            }

            imageUrl = $"/uploads/services/{fileName}";
        }

        var service = new SalonService
        {
            ServiceType = request.ServiceType,
            Description = request.Description,
            Name = request.ServiceType.ToString(),
            Price = request.Price,
            DurationMinutes = request.DurationMinutes,
            ImageUrl = imageUrl
        };
        await _salonRepository.AddGalleryImageAsync(userId, imageUrl);
        await _salonRepository.AddServiceAsync(userId, service);

        return NoContent();
    }
    [Authorize(Roles = "Salon")]
    [HttpDelete("remove-service/{serviceType}")]
    public async Task<IActionResult> RemoveService(ServiceType serviceType)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { error = "Salon profil nije pronađen." });

        await _salonRepository.RemoveServiceAsync(userId, serviceType);

        return NoContent();

    }
    [Authorize(Roles = "Salon")]
    [HttpPut("update-service")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateService([FromForm] SalonServiceReq request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { error = "Salon profil nije pronađen." });

        var existingService = salon.Services
            .FirstOrDefault(s => s.ServiceType == request.ServiceType);

        if (existingService == null)
            return NotFound(new { error = "Usluga nije pronađena." });

        string? imageUrl = existingService.ImageUrl;

        if (request.Image != null && request.Image.Length > 0)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Image.FileName)}";
            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "services");
            Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.Image.CopyToAsync(stream);
            }

            imageUrl = $"/uploads/services/{fileName}";
        }

        var updatedService = new SalonService
        {
            ServiceType = request.ServiceType,
            Description = request.Description,
            Name = request.ServiceType.ToString(),
            Price = request.Price,
            DurationMinutes = request.DurationMinutes,
            ImageUrl = imageUrl
        };

        await _salonRepository.UpdateServiceAsync(userId, updatedService);

        return NoContent();
    }
    [HttpGet("specific-salon/{salonId}")]
    public async Task<IActionResult> GetSpecificSalon(string salonId)
    {
        var salon = await _salonRepository.GetByIdAsync(salonId);

        if (salon == null)
            return NotFound(new { error = "Salon profil nije pronađen." });

        return Ok(salon);
    }
    [Authorize(Roles = "Salon")]
    [HttpDelete("delete-salon/{salonId}")]
    public async Task<IActionResult> DeleteSalon(string salonId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { error = "Salon profil nije pronađen." });

        await _salonRepository.DeleteAsync(salonId);

        return NoContent();
    }

    [HttpGet("get-services-from-salon/{salonId}")]
    public async Task<IActionResult> GetServicesFromSalon(string salonId)
    {
        var services = await _salonRepository.GetServicesAsync(salonId);

        return Ok(services);
    }

    [HttpGet("get-by-city/{city}")]
    public async Task<IActionResult> GetByCity(string city)
    {
        var salons = await _salonRepository.GetByCityAsync(city);
        return Ok(salons);
    }
    [HttpGet("search-by-service/{serviceType}")]
    public async Task<IActionResult> SearchByService(string serviceType)
    {
        var salons = await _salonRepository.GetByServiceTypeAsync(serviceType);
        if (salons == null || !salons.Any())
        {
            return Ok(new
            {
                message = "Ne postoji salon sa takvim tipom usluge.",
                data = new List<Salon>()
            });
        }
        else { return Ok(salons); }


    }
    [HttpGet("search-by-price-service/{serviceType}")]
    public async Task<IActionResult> SearchByPriceService(string serviceType, [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice)
    {
        var results = await _salonRepository.SearchByPrice(serviceType, minPrice, maxPrice);
        if (results == null || !results.Any())
        {
            return Ok(new
            {
                message = "Ne postoji salon sa takvim tipom usluge u zadatom cenovnom rangu.",
                data = new List<SalonSearchResultDto>()
            });
        }

        return Ok(results);
    }
    [HttpGet("search-by-working-hours")]
    public async Task<IActionResult> SearchByWorkingHours([FromQuery] int day, [FromQuery] string startTime, [FromQuery] string endTime)
    {
        var results = await _salonRepository.SearchByWorkingDays(day, startTime, endTime);
        return Ok(results);
    }
    [HttpGet("open-now")]
    public async Task<IActionResult> OpenNow([FromQuery] string city)
    {
        var results = await _salonRepository.OpenNow(city);
        return Ok(results);
    }
    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string? city,
        [FromQuery] string? serviceType,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? day,
        [FromQuery] string? time)
    {
        var results = await _salonRepository.SearchAsync(city, serviceType, minPrice, maxPrice, day, time);

        if (results == null || !results.Any())
        {
            return Ok(new
            {
                message = "Ne postoji salon za zadate filtere.",
                data = new List<SalonSearchResultDto>()
            });
        }

        return Ok(results);
    }
    [Authorize(Roles = "Salon")]
    [HttpPost("gallery")]
    public async Task<IActionResult> AddGalleryImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Fajl nije prosleđen.");

        var ext = Path.GetExtension(file.FileName).ToLower();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };

        if (!allowedExtensions.Contains(ext))
            return BadRequest("Dozvoljeni su samo JPG i PNG fajlovi.");

        var fileName = $"{Guid.NewGuid()}{ext}";
        var folder = "wwwroot/uploads/salons/gallery";

        Directory.CreateDirectory(folder);

        var path = Path.Combine(folder, fileName);

        using (var stream = new FileStream(path, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var imageUrl = $"/uploads/salons/gallery/{fileName}";

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        await _salonRepository.AddGalleryImageAsync(userId, imageUrl);

        return Ok(new { imageUrl });
    }
    [HttpDelete("gallery")]
    [Authorize(Roles = "Salon")]
    public async Task<IActionResult> RemoveGalleryImage([FromQuery] string imageUrl)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound("Salon nije pronađen.");

        await _salonRepository.RemoveGalleryImageAsync(salon.Id, imageUrl);

        return NoContent();
    }
    [Authorize(Roles = "Salon")]
    [HttpGet("my-working-days")]
    public async Task<IActionResult> GetMyWorkingDays()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nedostaje UserId u tokenu." });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { message = "Salon nije pronađen." });

        return Ok(salon.WorkingDays);
    }
    private async Task<string> SaveImageAsync(IFormFile image, string folder)
    {
        if (image == null || image.Length == 0)
            throw new Exception("Slika nije poslata.");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", folder);

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var extension = Path.GetExtension(image.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await image.CopyToAsync(stream);

        return $"/uploads/{folder}/{fileName}";
    }
    [HttpGet("get-salon-by-slug-or-id/{value}")]
    public async Task<IActionResult> GetBySlugOrId(string value)
    {
        var salon = await _salonRepository.GetBySlugAsync(value);

        if (salon == null)
            salon = await _salonRepository.GetByIdAsync(value);

        if (salon == null)
            return NotFound(new { message = "Salon nije pronađen." });

        return Ok(salon);
    }

}