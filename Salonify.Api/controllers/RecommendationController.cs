using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salonify.Api.Services;
using System.Security.Claims;

[ApiController]
[Route("api/recommendations")]
public class RecommendationController : ControllerBase
{
    private readonly RecommendationService _recommendationService;
    private readonly ActivityTrackingService _activityTrackingService;
    private readonly UserRepository _userRepository;

    public RecommendationController(
        RecommendationService recommendationService,
        ActivityTrackingService activityTrackingService,
        UserRepository userRepository)
    {
        _recommendationService = recommendationService;
        _activityTrackingService = activityTrackingService;
        _userRepository = userRepository;
    }

    [Authorize(Roles = "User,Admin")]
    [HttpGet]
    public async Task<IActionResult> GetRecommendedSalons()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Nedostaje UserId u tokenu." });

        var recommendations = await _recommendationService.GetRecommendedSalonsAsync(userId);

        return Ok(recommendations);
    }

    [Authorize(Roles = "User,Admin")]
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetRecommendationsForUser(string userId)
    {
        var recommendations = await _recommendationService.GetRecommendationsForUser(userId);

        return Ok(recommendations);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("refresh-salon-feature-vectors")]
    public async Task<IActionResult> RefreshSalonFeatureVectors()
    {
        await _activityTrackingService.UpdateAllSalonFeatureVectorsAsync();

        return Ok(new { message = "FeatureVector je osvezen za sve salone." });
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("normalize-user-preference-vectors")]
    public async Task<IActionResult> NormalizeUserPreferenceVectors()
    {
        await _userRepository.NormalizeAllPreferenceVectorsAsync();

        return Ok(new { message = "PreferenceVector je normalizovan za sve korisnike." });
    }
}
