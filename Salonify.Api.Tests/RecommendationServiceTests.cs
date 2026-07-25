using Salonify.Api.Services;

namespace Salonify.Api.Tests;

public class RecommendationServiceTests
{
    private static SalonService Service(ServiceType type, string name = "Usluga") => new()
    {
        ServiceType = type,
        Name = name,
        Description = string.Empty,
        ImageUrl = string.Empty
    };

    // ---------- BuildSalonFeatureVector ----------

    [Fact]
    public void BuildSalonFeatureVector_SingleService_ScoresOneThird()
    {
        var vector = RecommendationService.BuildSalonFeatureVector(
            new List<SalonService> { Service(ServiceType.Haircut) });

        Assert.Equal(1.0 / 3.0, vector["Haircut"], precision: 10);
    }

    [Fact]
    public void BuildSalonFeatureVector_SaturatesAtOne()
    {
        var services = Enumerable.Range(0, 5)
            .Select(_ => Service(ServiceType.Manicure))
            .ToList();

        var vector = RecommendationService.BuildSalonFeatureVector(services);

        Assert.Equal(1.0, vector["Manicure"]);
    }

    [Fact]
    public void BuildSalonFeatureVector_ExcludesOtherServiceType()
    {
        var vector = RecommendationService.BuildSalonFeatureVector(
            new List<SalonService> { Service(ServiceType.Other), Service(ServiceType.Makeup) });

        Assert.False(vector.ContainsKey("Other"));
        Assert.True(vector.ContainsKey("Makeup"));
    }

    [Fact]
    public void BuildSalonFeatureVector_NoServices_ReturnsEmpty()
    {
        Assert.Empty(RecommendationService.BuildSalonFeatureVector(null));
        Assert.Empty(RecommendationService.BuildSalonFeatureVector(new List<SalonService>()));
    }

    // ---------- NormalizePreferenceVector ----------

    [Fact]
    public void NormalizePreferenceVector_ScalesByMaxWhenAboveOne()
    {
        var normalized = RecommendationService.NormalizePreferenceVector(
            new Dictionary<string, double> { ["Haircut"] = 4.0, ["Makeup"] = 2.0 });

        Assert.Equal(1.0, normalized["Haircut"]);
        Assert.Equal(0.5, normalized["Makeup"]);
    }

    [Fact]
    public void NormalizePreferenceVector_KeepsValuesAlreadyInRange()
    {
        var normalized = RecommendationService.NormalizePreferenceVector(
            new Dictionary<string, double> { ["Haircut"] = 0.7, ["Makeup"] = 0.3 });

        Assert.Equal(0.7, normalized["Haircut"]);
        Assert.Equal(0.3, normalized["Makeup"]);
    }

    [Fact]
    public void NormalizePreferenceVector_FiltersNonPositiveValues()
    {
        var normalized = RecommendationService.NormalizePreferenceVector(
            new Dictionary<string, double> { ["Haircut"] = 0.8, ["Makeup"] = 0.0 });

        Assert.False(normalized.ContainsKey("Makeup"));
    }

    [Fact]
    public void NormalizePreferenceVector_EmptyOrZeroVector_ReturnsEmpty()
    {
        Assert.Empty(RecommendationService.NormalizePreferenceVector(new Dictionary<string, double>()));
        Assert.Empty(RecommendationService.NormalizePreferenceVector(
            new Dictionary<string, double> { ["Haircut"] = 0.0 }));
    }

    // ---------- CalculateCosineSimilarity ----------

    [Fact]
    public void CalculateCosineSimilarity_IdenticalVectors_ReturnsOne()
    {
        var vector = new Dictionary<string, double> { ["Haircut"] = 0.8, ["Makeup"] = 0.6 };

        var similarity = RecommendationService.CalculateCosineSimilarity(vector, new Dictionary<string, double>(vector));

        Assert.Equal(1.0, similarity, precision: 10);
    }

    [Fact]
    public void CalculateCosineSimilarity_NoOverlappingKeys_ReturnsZero()
    {
        var similarity = RecommendationService.CalculateCosineSimilarity(
            new Dictionary<string, double> { ["Haircut"] = 1.0 },
            new Dictionary<string, double> { ["Massage"] = 1.0 });

        Assert.Equal(0.0, similarity);
    }

    [Fact]
    public void CalculateCosineSimilarity_PartialOverlap_ReturnsBetweenZeroAndOne()
    {
        var similarity = RecommendationService.CalculateCosineSimilarity(
            new Dictionary<string, double> { ["Haircut"] = 1.0, ["Makeup"] = 1.0 },
            new Dictionary<string, double> { ["Haircut"] = 1.0, ["Massage"] = 1.0 });

        Assert.InRange(similarity, 0.0001, 0.9999);
    }

    // ---------- BuildRecommendation ----------

    [Fact]
    public void BuildRecommendation_MatchingPreference_ReturnsScoredRecommendation()
    {
        var salon = new Salon
        {
            Id = "salon-1",
            Name = "Studio Lepote",
            Services = new List<SalonService> { Service(ServiceType.Haircut, "Žensko šišanje") }
        };
        var preferences = new Dictionary<string, double> { ["Haircut"] = 1.0 };

        var recommendation = RecommendationService.BuildRecommendation(
            salon, preferences, new List<UserActivity>());

        Assert.NotNull(recommendation);
        Assert.Equal("salon-1", recommendation.SalonId);
        Assert.True(recommendation.SimilarityScore > 0);
        Assert.Equal(ServiceType.Haircut, recommendation.ReasonServiceType);
        Assert.Equal("Žensko šišanje", recommendation.ReasonServiceName);
        Assert.Null(recommendation.ReasonActivityType);
    }

    [Fact]
    public void BuildRecommendation_MatchingActivity_SetsActivityReason()
    {
        var salon = new Salon
        {
            Id = "salon-1",
            Name = "Studio Lepote",
            Services = new List<SalonService> { Service(ServiceType.Massage, "Relax masaža") }
        };
        var preferences = new Dictionary<string, double> { ["Massage"] = 1.0 };
        var activities = new List<UserActivity>
        {
            new()
            {
                Id = "activity-1",
                UserId = "user-1",
                ServiceType = ServiceType.Massage,
                ActivityType = ActivityType.AppointmentCompleted,
                Weight = ActivityWeights.GetWeight(ActivityType.AppointmentCompleted)
            }
        };

        var recommendation = RecommendationService.BuildRecommendation(salon, preferences, activities);

        Assert.NotNull(recommendation);
        Assert.Equal(ActivityType.AppointmentCompleted, recommendation.ReasonActivityType);
    }

    [Fact]
    public void BuildRecommendation_NoPreferenceOverlap_ReturnsNull()
    {
        var salon = new Salon
        {
            Id = "salon-1",
            Name = "Studio Lepote",
            Services = new List<SalonService> { Service(ServiceType.Pedicure) }
        };
        var preferences = new Dictionary<string, double> { ["Haircut"] = 1.0 };

        var recommendation = RecommendationService.BuildRecommendation(
            salon, preferences, new List<UserActivity>());

        Assert.Null(recommendation);
    }

    [Fact]
    public void BuildRecommendation_SalonWithoutServices_ReturnsNull()
    {
        var salon = new Salon { Id = "salon-1", Name = "Prazan Salon" };

        var recommendation = RecommendationService.BuildRecommendation(
            salon, new Dictionary<string, double> { ["Haircut"] = 1.0 }, new List<UserActivity>());

        Assert.Null(recommendation);
    }

    [Fact]
    public void BuildRecommendation_UsesStoredFeatureVectorWhenPresent()
    {
        var salon = new Salon
        {
            Id = "salon-1",
            Name = "Studio Lepote",
            FeatureVector = new Dictionary<string, double> { ["Facial"] = 1.0 },
            Services = new List<SalonService> { Service(ServiceType.Facial, "Tretman lica") }
        };
        var preferences = new Dictionary<string, double> { ["Facial"] = 1.0 };

        var recommendation = RecommendationService.BuildRecommendation(
            salon, preferences, new List<UserActivity>());

        Assert.NotNull(recommendation);
        Assert.Equal(1.0, recommendation.SimilarityScore, precision: 10);
    }
}
