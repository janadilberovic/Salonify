using Salonify.Api.Repositories;

namespace Salonify.Api.Services;

public class RecommendationService
{
    private readonly UserRepository _userRepository;
    private readonly UserActivityRepository _userActivityRepository;
    private readonly SalonRepository _salonRepository;

    public RecommendationService(
        UserRepository userRepository,
        UserActivityRepository userActivityRepository,
        SalonRepository salonRepository)
    {
        _userRepository = userRepository;
        _userActivityRepository = userActivityRepository;
        _salonRepository = salonRepository;
    }

    public async Task<List<SalonRecommendationDto>> GetRecommendedSalonsAsync(
        string userId,
        int limit = 9)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        var activities = await _userActivityRepository.GetByUserIdAsync(userId);

        if (user == null || user.PreferenceVector.Count == 0 || activities.Count == 0)
            return new List<SalonRecommendationDto>();

        var salons = await _salonRepository.GetAllAsync();

        return salons
            .Select(salon => BuildRecommendation(salon, user.PreferenceVector, activities))
            .Where(x => x != null)
            .Select(x => x!)
            .Where(x => x.SimilarityScore > 0)
            .OrderByDescending(x => x.SimilarityScore)
            .ThenBy(x => x.SalonName)
            .Take(limit)
            .ToList();
    }

    public Task<List<SalonRecommendationDto>> GetRecommendationsForUser(string userId)
    {
        return GetRecommendedSalonsAsync(userId);
    }

    private static SalonRecommendationDto? BuildRecommendation(
        Salon salon,
        Dictionary<string, double> preferenceVector,
        List<UserActivity> activities)
    {
        var directActivities = activities
            .Where(x => x.SalonId == salon.Id)
            .ToList();

        if (directActivities.Count == 0)
            return null;

        var featureVector = salon.FeatureVector.Count > 0
            ? salon.FeatureVector
            : BuildSalonFeatureVector(salon.Services);

        if (featureVector.Count == 0)
            return null;

        var reasonActivity = GetStrongestDirectActivity(
            directActivities,
            preferenceVector,
            featureVector
        );

        if (reasonActivity == null)
            return null;

        var reasonServiceType = reasonActivity.ServiceType;

        if (reasonServiceType == ServiceType.Other)
            return null;

        return new SalonRecommendationDto
        {
            SalonId = salon.Id,
            SalonName = salon.Name,
            Salon = salon,
            SimilarityScore = CalculateCosineSimilarity(preferenceVector, featureVector),
            ReasonServiceType = reasonServiceType,
            ReasonActivityType = reasonActivity.ActivityType
        };
    }

    private static Dictionary<string, double> BuildSalonFeatureVector(List<SalonService> services)
    {
        return services
            .Where(x => x.ServiceType != ServiceType.Other)
            .GroupBy(x => x.ServiceType.ToString())
            .ToDictionary(x => x.Key, x => (double)x.Count());
    }

    private static UserActivity? GetStrongestDirectActivity(
        List<UserActivity> directActivities,
        Dictionary<string, double> preferenceVector,
        Dictionary<string, double> featureVector)
    {
        return directActivities
            .Where(x => x.ServiceType != ServiceType.Other)
            .Where(x =>
            {
                var key = x.ServiceType.ToString();
                return preferenceVector.TryGetValue(key, out var preference)
                    && preference > 0
                    && featureVector.TryGetValue(key, out var feature)
                    && feature > 0;
            })
            .OrderByDescending(x => x.Weight)
            .ThenByDescending(x => x.CreatedAt)
            .FirstOrDefault();
    }

    private static double CalculateCosineSimilarity(
        Dictionary<string, double> preferenceVector,
        Dictionary<string, double> featureVector)
    {
        var matchingKeys = featureVector.Keys
            .Where(preferenceVector.ContainsKey)
            .ToList();

        if (matchingKeys.Count == 0)
            return 0;

        var dotProduct = matchingKeys.Sum(key => featureVector[key] * preferenceVector[key]);
        var preferenceMagnitude = Math.Sqrt(preferenceVector.Values.Sum(x => x * x));
        var featureMagnitude = Math.Sqrt(featureVector.Values.Sum(x => x * x));

        if (preferenceMagnitude == 0 || featureMagnitude == 0)
            return 0;

        return dotProduct / (preferenceMagnitude * featureMagnitude);
    }
}
