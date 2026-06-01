public class SalonRecommendationDto
{
    public string SalonId { get; set; }

    public string SalonName { get; set; }

    public double SimilarityScore { get; set; }

    public Salon Salon { get; set; }

    public ServiceType ReasonServiceType { get; set; }

    public ActivityType? ReasonActivityType { get; set; }
}
