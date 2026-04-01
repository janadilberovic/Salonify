public class SalonServiceResponseDTO
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public ServiceType ServiceType { get; set; }
    public int DurationMinutes { get; set; }
    public string? ImageUrl { get; set; }
}