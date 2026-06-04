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

        if (user == null || user.PreferenceVector.Count == 0)
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
        var featureVector = salon.FeatureVector.Count > 0
            ? salon.FeatureVector
            : BuildSalonFeatureVector(salon.Services);

        if (featureVector.Count == 0)
            return null;

        var similarityScore = CalculateCosineSimilarity(preferenceVector, featureVector);

        if (similarityScore <= 0)
            return null;

        var reasonServiceType = GetStrongestMatchingServiceType(
            preferenceVector,
            featureVector
        );

        if (reasonServiceType == ServiceType.Other)
            return null;

        var reasonActivity = activities
            .Where(x => x.ServiceType == reasonServiceType)
            .OrderByDescending(x => x.Weight)
            .ThenByDescending(x => x.CreatedAt)
            .FirstOrDefault();

        return new SalonRecommendationDto
        {
            SalonId = salon.Id,
            SalonName = salon.Name,
            Salon = salon,
            SimilarityScore = similarityScore,
            ReasonServiceType = reasonServiceType,
            ReasonActivityType = reasonActivity?.ActivityType
        };
    }

    private static Dictionary<string, double> BuildSalonFeatureVector(List<SalonService> services)
    {
        return services
            .Where(x => x.ServiceType != ServiceType.Other)
            .GroupBy(x => x.ServiceType.ToString())
            .ToDictionary(x => x.Key, x => (double)x.Count());
    }

    private static ServiceType GetStrongestMatchingServiceType(
        Dictionary<string, double> preferenceVector,
        Dictionary<string, double> featureVector)
    {
        var serviceType = featureVector
            .Where(x =>
            {
                return preferenceVector.TryGetValue(x.Key, out var preference)
                    && preference > 0
                    && x.Value > 0;
            })
            .OrderByDescending(x => preferenceVector[x.Key] * x.Value)
            .Select(x => x.Key)
            .FirstOrDefault();

        return Enum.TryParse<ServiceType>(serviceType, out var parsed)
            ? parsed
            : ServiceType.Other;
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
