namespace Salonify.Api.Tests;

public class ActivityWeightsTests
{
    [Theory]
    [InlineData(ActivityType.Search, 1.0)]
    [InlineData(ActivityType.ViewSalon, 2.0)]
    [InlineData(ActivityType.ViewService, 3.0)]
    [InlineData(ActivityType.AppointmentCreated, 5.0)]
    [InlineData(ActivityType.AppointmentCompleted, 7.0)]
    [InlineData(ActivityType.ReviewAdded, 4.0)]
    public void GetWeight_ReturnsExpectedWeight(ActivityType type, double expected)
    {
        Assert.Equal(expected, ActivityWeights.GetWeight(type));
    }

    [Fact]
    public void GetWeight_CompletedAppointment_HasHighestWeight()
    {
        var allWeights = Enum.GetValues<ActivityType>()
            .Select(ActivityWeights.GetWeight)
            .ToList();

        Assert.Equal(allWeights.Max(), ActivityWeights.GetWeight(ActivityType.AppointmentCompleted));
    }
}
