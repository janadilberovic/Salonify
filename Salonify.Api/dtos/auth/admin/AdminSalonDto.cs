public class AdminSalonDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int ServicesCount { get; set; }
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}
