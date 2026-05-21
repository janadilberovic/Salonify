public class ReviewSearchQuery
{
    public int? MinRating { get; set; }

    public ServiceType? ServiceType { get; set; }

    public string? SortBy { get; set; } = "newest";
}