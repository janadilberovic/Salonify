using Salonify.Api.Repositories;

namespace Salonify.Api.Services;

public class ActivityTrackingService
{
    private readonly UserActivityRepository _userActivityRepository;
    private readonly UserRepository _userRepository;
    private readonly SalonRepository _salonRepository;

    public ActivityTrackingService(
        UserActivityRepository userActivityRepository,
        UserRepository userRepository,
        SalonRepository salonRepository)
    {
        _userActivityRepository = userActivityRepository;
        _userRepository = userRepository;
        _salonRepository = salonRepository;
    }

    public async Task TrackAsync(
        string? userId,
        ActivityType activityType,
        ServiceType serviceType,
        string? salonId = null)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return;

        var weight = ActivityWeights.GetWeight(activityType);

        await _userActivityRepository.CreateAsync(new UserActivity
        {
            UserId = userId,
            SalonId = salonId,
            ServiceType = serviceType,
            ActivityType = activityType,
            Weight = weight,
            CreatedAt = DateTime.UtcNow
        });

        await _userRepository.IncrementPreferenceAsync(userId, GetFeatureKey(serviceType), weight);
    }

    public async Task TrackSalonAsync(
        string? userId,
        ActivityType activityType,
        Salon salon)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return;

        var featureVector = BuildFeatureVector(salon);
        var primaryServiceType = GetPrimaryServiceType(featureVector);
        var weight = ActivityWeights.GetWeight(activityType);

        await _userActivityRepository.CreateAsync(new UserActivity
        {
            UserId = userId,
            SalonId = salon.Id,
            ServiceType = primaryServiceType,
            ActivityType = activityType,
            Weight = weight,
            CreatedAt = DateTime.UtcNow
        });

        if (featureVector.Count == 0)
        {
            await _userRepository.IncrementPreferenceAsync(userId, GetFeatureKey(ServiceType.Other), weight);
            return;
        }

        await _userRepository.IncrementPreferencesAsync(
            userId,
            featureVector.ToDictionary(x => x.Key, x => x.Value * weight)
        );
    }

    public async Task UpdateSalonFeatureVectorAsync(string salonId)
    {
        var salon = await _salonRepository.GetByIdAsync(salonId);

        if (salon == null)
            return;

        await _salonRepository.UpdateFeatureVectorAsync(salon.Id, BuildFeatureVector(salon));
    }

    public async Task UpdateSalonFeatureVectorByUserIdAsync(string userId)
    {
        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return;

        await _salonRepository.UpdateFeatureVectorAsync(salon.Id, BuildFeatureVector(salon));
    }

    public async Task UpdateAllSalonFeatureVectorsAsync()
    {
        var salons = await _salonRepository.GetAllAsync();

        foreach (var salon in salons)
        {
            await _salonRepository.UpdateFeatureVectorAsync(salon.Id, BuildFeatureVector(salon));
        }
    }

    private static Dictionary<string, double> BuildFeatureVector(Salon salon)
    {
        if (salon.Services == null || salon.Services.Count == 0)
            return new Dictionary<string, double>();

        return salon.Services
            .GroupBy(x => GetFeatureKey(x.ServiceType))
            .ToDictionary(x => x.Key, x => (double)x.Count());
    }

    private static ServiceType GetPrimaryServiceType(Dictionary<string, double> featureVector)
    {
        var primaryFeature = featureVector
            .OrderByDescending(x => x.Value)
            .Select(x => x.Key)
            .FirstOrDefault();

        return Enum.TryParse<ServiceType>(primaryFeature, out var serviceType)
            ? serviceType
            : ServiceType.Other;
    }

    private static string GetFeatureKey(ServiceType serviceType)
    {
        return serviceType.ToString();
    }
}
