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

    private static SalonRecommendationDto? BuildRecommendation(
        Salon salon,
        Dictionary<string, double> preferenceVector,
        List<UserActivity> activities)
    {
        var featureVector = salon.FeatureVector.Count > 0
            ? salon.FeatureVector
            : BuildSalonFeatureVector(salon.Services);

        if (featureVector.Count == 0)
            return null;

        var reasonFeature = GetStrongestMatchingFeature(preferenceVector, featureVector);

        if (reasonFeature == null)
            return null;

        var reasonServiceType = Enum.TryParse<ServiceType>(reasonFeature, out var parsedServiceType)
            ? parsedServiceType
            : ServiceType.Other;

        if (reasonServiceType == ServiceType.Other)
            return null;

        var reasonActivityType = activities
            .Where(x => x.ServiceType == reasonServiceType)
            .OrderByDescending(x => x.Weight)
            .ThenByDescending(x => x.CreatedAt)
            .Select(x => (ActivityType?)x.ActivityType)
            .FirstOrDefault();

        if (reasonActivityType == null)
            return null;

        return new SalonRecommendationDto
        {
            SalonId = salon.Id,
            SalonName = salon.Name,
            Salon = salon,
            SimilarityScore = CalculateCosineSimilarity(preferenceVector, featureVector),
            ReasonServiceType = reasonServiceType,
            ReasonActivityType = reasonActivityType
        };
    }

    private static Dictionary<string, double> BuildSalonFeatureVector(List<SalonService> services)
    {
        return services
            .Where(x => x.ServiceType != ServiceType.Other)
            .GroupBy(x => x.ServiceType.ToString())
            .ToDictionary(x => x.Key, x => (double)x.Count());
    }

    private static string? GetStrongestMatchingFeature(
        Dictionary<string, double> preferenceVector,
        Dictionary<string, double> featureVector)
    {
        return featureVector
            .Where(x => preferenceVector.TryGetValue(x.Key, out var preference) && preference > 0 && x.Value > 0)
            .OrderByDescending(x => x.Value * preferenceVector[x.Key])
            .Select(x => x.Key)
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
