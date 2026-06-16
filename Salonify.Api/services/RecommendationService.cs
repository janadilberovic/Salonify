using Salonify.Api.Repositories;

namespace Salonify.Api.Services;

public class RecommendationService
{
    private const double ServiceCountSaturation = 3.0;
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

        var recommendations = new List<SalonRecommendationDto>();

        foreach (var salon in salons)
        {
            var recommendation = BuildRecommendation(
                salon,
                user.PreferenceVector,
                activities
            );

            if (recommendation != null && recommendation.SimilarityScore > 0)
            {
                Console.WriteLine(
                    $"[Recommendation] Salon='{recommendation.SalonName}', " +
                    $"Score={recommendation.SimilarityScore:F4}, " +
                    $"ReasonServiceType={recommendation.ReasonServiceType}, " +
                    $"ReasonServiceName='{recommendation.ReasonServiceName}', " +
                    $"ReasonActivityType={recommendation.ReasonActivityType?.ToString() ?? "None"}"
                );

                recommendations.Add(recommendation);
            }
            else
            {
                Console.WriteLine(
                    $"[Recommendation] Salon='{salon.Name}', Score=0.0000, skipped because there is no matching positive similarity."
                );
            }
        }

        return recommendations
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
        var storedFeatureVector = salon.FeatureVector ?? new Dictionary<string, double>();
        var services = salon.Services ?? new List<SalonService>();
        var featureVector = storedFeatureVector.Count > 0
            ? storedFeatureVector
            : BuildSalonFeatureVector(services);
        var normalizedPreferenceVector = NormalizePreferenceVector(preferenceVector);
        var normalizedFeatureVector = NormalizeFeatureVector(featureVector);

        if (normalizedFeatureVector.Count == 0)
            return null;

        var similarityScore = CalculateCosineSimilarity(
            normalizedPreferenceVector,
            normalizedFeatureVector
        );

        if (similarityScore <= 0)
            return null;

        var reason = GetRecommendationReason(
            normalizedPreferenceVector,
            normalizedFeatureVector,
            activities
        );

        if (reason.ServiceType == ServiceType.Other)
            return null;

        var reasonServiceName = GetServiceName(services, reason.ServiceType);

        return new SalonRecommendationDto
        {
            SalonId = salon.Id,
            SalonName = salon.Name,
            Salon = salon,
            SimilarityScore = similarityScore,
            ReasonServiceType = reason.ServiceType,
            ReasonServiceName = string.IsNullOrWhiteSpace(reasonServiceName)
                ? string.Empty
                : reasonServiceName,
            ReasonActivityType = reason.ActivityType
        };
    }

    private static string GetServiceName(
        List<SalonService>? services,
        ServiceType serviceType)
    {
        if (services == null || services.Count == 0)
            return string.Empty;

        foreach (var service in services)
        {
            if (service.ServiceType == serviceType && !string.IsNullOrWhiteSpace(service.Name))
                return service.Name;
        }

        return string.Empty;
    }

    private static Dictionary<string, double> BuildSalonFeatureVector(List<SalonService>? services)
    {
        if (services == null || services.Count == 0)
            return new Dictionary<string, double>();

        return services
            .Where(x => x.ServiceType != ServiceType.Other)
            .GroupBy(x => x.ServiceType.ToString())
            .ToDictionary(
                x => x.Key,
                x => Math.Min(x.Count() / ServiceCountSaturation, 1.0)
            );
    }

    private static Dictionary<string, double> NormalizePreferenceVector(
        Dictionary<string, double> preferenceVector)
    {
        if (preferenceVector.Count == 0)
            return new Dictionary<string, double>();

        var maxValue = preferenceVector.Values.Max();

        if (maxValue <= 0)
            return new Dictionary<string, double>();

        if (maxValue <= 1.0)
        {
            return preferenceVector
                .Where(x => x.Value > 0)
                .ToDictionary(x => x.Key, x => x.Value);
        }

        return preferenceVector
            .Where(x => x.Value > 0)
            .ToDictionary(x => x.Key, x => Math.Min(x.Value / maxValue, 1.0));
    }

    private static Dictionary<string, double> NormalizeFeatureVector(
        Dictionary<string, double> featureVector)
    {
        if (featureVector.Count == 0)
            return new Dictionary<string, double>();

        return featureVector
            .Where(x => x.Value > 0)
            .ToDictionary(x => x.Key, x =>
            {
                if (x.Value <= 1.0)
                    return x.Value;

                return Math.Min(x.Value / ServiceCountSaturation, 1.0);
            });
    }

    private static RecommendationReason GetRecommendationReason(
        Dictionary<string, double> preferenceVector,
        Dictionary<string, double> featureVector,
        List<UserActivity> activities)
    {
        var matchingServices = featureVector
            .Where(x =>
            {
                return preferenceVector.TryGetValue(x.Key, out var preference)
                    && preference > 0
                    && x.Value > 0;
            })
            .Select(x => new
            {
                ServiceKey = x.Key,
                Contribution = preferenceVector[x.Key] * x.Value
            })
            .ToList();

        if (matchingServices.Count == 0)
            return new RecommendationReason(ServiceType.Other, null);

        var matchingActivities = activities
            .Where(activity => matchingServices.Any(service =>
                Enum.TryParse<ServiceType>(service.ServiceKey, out var serviceType)
                && serviceType == activity.ServiceType))
            .Select(activity =>
            {
                var service = matchingServices.First(x =>
                    Enum.TryParse<ServiceType>(x.ServiceKey, out var serviceType)
                    && serviceType == activity.ServiceType);

                return new
                {
                    activity.ServiceType,
                    activity.ActivityType,
                    activity.Weight,
                    activity.CreatedAt,
                    service.Contribution
                };
            })
            .OrderByDescending(x => x.Weight)
            .ThenByDescending(x => x.Contribution)
            .ThenByDescending(x => x.CreatedAt)
            .FirstOrDefault();

        if (matchingActivities != null)
            return new RecommendationReason(matchingActivities.ServiceType, matchingActivities.ActivityType);

        var strongestServiceKey = matchingServices
            .OrderByDescending(x => x.Contribution)
            .Select(x => x.ServiceKey)
            .FirstOrDefault();

        return Enum.TryParse<ServiceType>(strongestServiceKey, out var parsed)
            ? new RecommendationReason(parsed, null)
            : new RecommendationReason(ServiceType.Other, null);
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

    private sealed record RecommendationReason(
        ServiceType ServiceType,
        ActivityType? ActivityType);
}
