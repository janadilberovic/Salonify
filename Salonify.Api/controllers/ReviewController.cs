using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salonify.Api.Repositories;
using System.Security.Claims;

namespace Salonify.Api.Controllers;

[ApiController]
[Route("api/review")]
public class ReviewController : ControllerBase
{
    private readonly ReviewRepository _reviewRepository;
    private readonly SalonRepository _salonRepository;
    private readonly AppointmentRepository _appointmentRepository;
    public ReviewController(ReviewRepository reviewRepository, SalonRepository salonRepository, AppointmentRepository appointmentRepository)
    {
        _reviewRepository = reviewRepository;
        _salonRepository = salonRepository;
        _appointmentRepository = appointmentRepository;

    }

    [Authorize(Roles = "User")]
    [HttpPost("create-review")]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto reviewDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje userId u tokenu." });

        var salonID = reviewDto.SalonId;
        var salon = await _salonRepository.GetBySalonIdAsync(salonID);
        if (salon == null)
        {
            return BadRequest("ne postoji salon sa zadatim idjem");
        }
        var rating = reviewDto.Rating;
        if (rating < 1 || rating > 5)
        {
            return BadRequest("Ocena mora biti u rangu 1-5");
        }
        var existingReview = await _reviewRepository.GetByUserAndSalon(userId, reviewDto.SalonId);
        if (existingReview != null)
        {
            return BadRequest("Već ste ostavili recenziju za ovaj salon.");
        }
        var completedAppointment = await _appointmentRepository
    .GetCompletedAppointmentForUserAndSalon(userId, reviewDto.SalonId);

        if (completedAppointment == null)
        {
            return BadRequest("Možete ostaviti recenziju samo za salon u kome ste imali završen termin.");
        }
        if (!string.IsNullOrWhiteSpace(reviewDto.Comment) && reviewDto.Comment.Length > 500)
        {
            return BadRequest("Komentar ne sme biti duži od 500 karaktera.");
        }
        Review review = new Review
        {
            UserId = userId,
            SalonId = reviewDto.SalonId,
            Comment = reviewDto.Comment,
            CreatedAt = DateTime.UtcNow,
            ServiceType=reviewDto.ServiceType,
            Rating = reviewDto.Rating
        };
        await _reviewRepository.CreateReview(review);
        return Ok();
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
    public async Task<IActionResult> GetReviewsForSalon([FromQuery]string salonId)
    {
       
        var salon= await _salonRepository.GetByIdAsync(salonId);
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
}