using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salonify.Api.Repositories;
using Salonify.Api.Services;
using System.Security.Claims;

namespace Salonify.Api.Controllers;

[ApiController]
[Route("api/review")]
public class ReviewController : ControllerBase
{
    private readonly ReviewRepository _reviewRepository;
    private readonly SalonRepository _salonRepository;
    private readonly AppointmentRepository _appointmentRepository;
    private readonly ActivityTrackingService _activityTrackingService;
    public ReviewController(
        ReviewRepository reviewRepository,
        SalonRepository salonRepository,
        AppointmentRepository appointmentRepository,
        ActivityTrackingService activityTrackingService)
    {
        _reviewRepository = reviewRepository;
        _salonRepository = salonRepository;
        _appointmentRepository = appointmentRepository;
        _activityTrackingService = activityTrackingService;

    }

    [Authorize(Roles = "User")]
    [HttpPost("create-review")]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto reviewDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });

        if (reviewDto == null)
            return BadRequest("Podaci za recenziju nisu validni.");

        if (string.IsNullOrWhiteSpace(reviewDto.AppointmentId))
            return BadRequest("Nedostaje termin za koji se ostavlja recenzija.");

        if (reviewDto.Rating < 1 || reviewDto.Rating > 5)
            return BadRequest("Ocena mora biti u rangu 1-5.");

        if (!string.IsNullOrWhiteSpace(reviewDto.Comment) && reviewDto.Comment.Length > 500)
            return BadRequest("Komentar ne sme biti duži od 500 karaktera.");

        var appointment = await _appointmentRepository.GetByIdAsync(reviewDto.AppointmentId);


        if (appointment == null)
            return NotFound("Termin ne postoji.");

        if (appointment.UserId != userId)
            return Forbid();

        if (appointment.Status != AppointmentStatus.Completed)
            return BadRequest("Recenziju možete ostaviti samo za završen tretman.");

        var salon = await _salonRepository.GetByIdAsync(appointment.SalonId);

        if (salon == null)
            return BadRequest("Salon za ovaj termin ne postoji.");

        var existingReview = await _reviewRepository.ExistsForSalonServiceAsync(
     userId,
     appointment.SalonId,
     appointment.ServiceType
 );

        if (existingReview)
            return BadRequest("Već ste ostavili recenziju za ovaj tretman.");

        var review = new Review
        {
            UserId = userId,
            SalonId = appointment.SalonId,
            AppointmentId = appointment.Id,
            ServiceName = appointment.ServiceName,
            Comment = reviewDto.Comment,
            CreatedAt = DateTime.UtcNow,
            ServiceType = appointment.ServiceType,
            Rating = reviewDto.Rating
        };

        await _reviewRepository.CreateReview(review);
        await _activityTrackingService.TrackAsync(
            userId,
            ActivityType.ReviewAdded,
            review.ServiceType,
            review.SalonId
        );



        return Ok(new
        {
            message = "Recenzija je uspešno dodata.",
            review
        });
    }
    [Authorize(Roles = "Admin")]
    [HttpDelete("delete-review/{reviewId}")]
    public async Task<IActionResult> DeleteReview(string reviewId)
    {
        var review = await _reviewRepository.GetByIdAsync(reviewId);
        if (review == null)
        {
            return NotFound("Recenzija ne postoji.");
        }
        await _reviewRepository.DeleteReviewAsync(reviewId);
        return NoContent();
    }

    [HttpGet("get-reviews-for-salon")]
    public async Task<IActionResult> GetReviewsForSalon([FromQuery] string salonId)
    {

        var salon = await _salonRepository.GetByIdAsync(salonId);
        if (salon == null)
        {
            return NotFound("salon ne postoji");
        }

        var reviews = await _reviewRepository.GetReviewsBySalon(salonId);
        return Ok(reviews);
    }
    [Authorize(Roles = "User,Admin,Salon")]
    [HttpGet("get-reviews-for-user")]
    public async Task<IActionResult> GetReviewsForUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });
        var reviews = await _reviewRepository.GetReviewsByUser(userId);
        return Ok(reviews);
    }
    [Authorize(Roles = "User,Admin,Salon")]
    [HttpGet("get-reviews-for-salon-and-user")]
    public async Task<IActionResult> GetReviewsForSalonAndUser([FromQuery] string salonID)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });
        var reviews = await _reviewRepository.GetByUserAndSalon(userId, salonID);
        return Ok(reviews);
    }
    //avg

    [HttpGet("get-average-reviews-for-salon")]
    public async Task<IActionResult> GetAverageForSalon([FromQuery] string salonID)
    {

        var avg = await _reviewRepository.GetAverageRatingForSalon(salonID);
        return Ok(avg);
    }
    //broj recenzija
    [HttpGet("get-reviews-count-for-salon")]
    public async Task<IActionResult> GetReviewsCountSalon([FromQuery] string salonId)
    {
        var num = await _reviewRepository.GetReviewCountForSalon(salonId);
        return Ok(num);
    }

    [HttpGet("salon/{salonId}/search")]
    public async Task<IActionResult> SearchReviewsForSalon(
     string salonId,
     [FromQuery] ReviewSearchQuery query)
    {
        var reviews = await _reviewRepository.SearchForSalonAsync(
            salonId,
            query.MinRating,
            query.ServiceType,
            query.SortBy
        );

        return Ok(reviews);
    }

}
