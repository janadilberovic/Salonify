using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salonify.Api.Repositories;

namespace Salonify.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly UserRepository _userRepository;
    private readonly SalonRepository _salonRepository;
    private readonly AppointmentRepository _appointmentRepository;
    private readonly ReviewRepository _reviewRepository;
    private readonly UserActivityRepository _userActivityRepository;

    public AdminController(
        UserRepository userRepository,
        SalonRepository salonRepository,
        AppointmentRepository appointmentRepository,
        ReviewRepository reviewRepository,
        UserActivityRepository userActivityRepository)
    {
        _userRepository = userRepository;
        _salonRepository = salonRepository;
        _appointmentRepository = appointmentRepository;
        _reviewRepository = reviewRepository;
        _userActivityRepository = userActivityRepository;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var totalUsers = await _userRepository.CountAsync();
        var totalSalons = await _salonRepository.CountAsync();
        var appointments = await _appointmentRepository.GetAllAsync();
        var salons = await _salonRepository.GetAllAsync();
        var reviews = await _reviewRepository.GetAllAsync();

        var stats = AdminStatsCalculator.Build(totalUsers, totalSalons, appointments, salons, reviews);

        return Ok(stats);
    }

    [HttpGet("get-all-users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();

        var result = users.Select(user => new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role.ToString(),
            Phone = user.Phone,
            ProfileImageUrl = user.ProfileImageUrl,
            CreatedAt = user.CreatedAt
        }).ToList();

        return Ok(result);
    }

    [HttpDelete("delete-user/{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
            return NotFound("Korisnik ne postoji.");

        if (user.Role == UserRole.Admin)
            return BadRequest("Nije moguće obrisati administratorski nalog.");

        if (user.Role == UserRole.Salon)
        {
            var salon = await _salonRepository.GetByUserIdAsync(userId);

            if (salon != null)
                await DeleteSalonCascadeAsync(salon.Id);
        }

        await _appointmentRepository.DeleteByUserIdAsync(userId);
        await _reviewRepository.DeleteByUserIdAsync(userId);
        await _userActivityRepository.DeleteByUserIdAsync(userId);
        await _userRepository.DeleteAsync(userId);

        return NoContent();
    }

    [HttpGet("get-all-salons")]
    public async Task<IActionResult> GetAllSalons()
    {
        var salons = await _salonRepository.GetAllAsync();
        var reviews = await _reviewRepository.GetAllAsync();

        var reviewsBySalon = reviews
            .GroupBy(r => r.SalonId)
            .ToDictionary(g => g.Key, g => g.ToList());

        var result = salons.Select(salon =>
        {
            reviewsBySalon.TryGetValue(salon.Id, out var salonReviews);

            return new AdminSalonDto
            {
                Id = salon.Id,
                UserId = salon.UserId,
                Name = salon.Name,
                City = salon.City,
                Address = salon.Address,
                Phone = salon.Phone,
                ImageUrl = salon.ImageUrl,
                ServicesCount = salon.Services?.Count ?? 0,
                AverageRating = salonReviews != null && salonReviews.Count > 0
                    ? Math.Round(salonReviews.Average(r => r.Rating), 2)
                    : 0,
                ReviewCount = salonReviews?.Count ?? 0
            };
        }).ToList();

        return Ok(result);
    }

    [HttpDelete("delete-salon/{salonId}")]
    public async Task<IActionResult> DeleteSalon(string salonId)
    {
        var salon = await _salonRepository.GetByIdAsync(salonId);

        if (salon == null)
            return NotFound("Salon ne postoji.");

        await DeleteSalonCascadeAsync(salonId);

        return NoContent();
    }

    [HttpGet("get-all-reviews")]
    public async Task<IActionResult> GetAllReviews()
    {
        var reviews = await _reviewRepository.GetAllAsync();
        var salons = await _salonRepository.GetAllAsync();
        var users = await _userRepository.GetAllAsync();

        var salonsById = salons.ToDictionary(s => s.Id);
        var usersById = users.ToDictionary(u => u.Id);

        var result = reviews
            .OrderByDescending(r => r.CreatedAt)
            .Select(review => new AdminReviewDto
            {
                Id = review.Id,
                SalonId = review.SalonId,
                SalonName = salonsById.TryGetValue(review.SalonId, out var salon)
                    ? salon.Name
                    : "Nepoznat salon",
                UserName = usersById.TryGetValue(review.UserId, out var user)
                    ? user.DisplayName
                    : "Korisnik",
                Rating = review.Rating,
                Comment = review.Comment,
                ServiceName = review.ServiceName,
                CreatedAt = review.CreatedAt
            })
            .ToList();

        return Ok(result);
    }

    // Briše salon zajedno sa njegovim terminima i recenzijama; vlasnički nalog ostaje.
    private async Task DeleteSalonCascadeAsync(string salonId)
    {
        await _appointmentRepository.DeleteBySalonIdAsync(salonId);
        await _reviewRepository.DeleteBySalonIdAsync(salonId);
        await _salonRepository.DeleteAsync(salonId);
    }
}
