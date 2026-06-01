namespace Salonify.Api.Services;

public class SalonFeatureVectorRefreshService : BackgroundService
{
    private static readonly TimeSpan RefreshInterval = TimeSpan.FromHours(6);
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SalonFeatureVectorRefreshService> _logger;

    public SalonFeatureVectorRefreshService(
        IServiceScopeFactory scopeFactory,
        ILogger<SalonFeatureVectorRefreshService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RefreshSalonFeatureVectorsAsync(stoppingToken);

        using var timer = new PeriodicTimer(RefreshInterval);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RefreshSalonFeatureVectorsAsync(stoppingToken);
        }
    }

    private async Task RefreshSalonFeatureVectorsAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var activityTrackingService =
                scope.ServiceProvider.GetRequiredService<ActivityTrackingService>();

            await activityTrackingService.UpdateAllSalonFeatureVectorsAsync();

            _logger.LogInformation("Salon feature vectors refreshed.");
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to refresh salon feature vectors.");
        }
    }
}
