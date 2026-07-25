public class AdminReviewDto
{
    public string Id { get; set; } = string.Empty;
    public string SalonId { get; set; } = string.Empty;
    public string SalonName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string ServiceName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
