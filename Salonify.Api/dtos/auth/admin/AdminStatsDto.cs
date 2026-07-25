public class AdminStatsDto
{
    public long TotalUsers { get; set; }
    public long TotalSalons { get; set; }
    public long TotalAppointments { get; set; }
    public long TotalReviews { get; set; }
    public Dictionary<string, int> AppointmentsByStatus { get; set; } = new();
    public List<TopSalonDto> TopSalons { get; set; } = new();
}

public class TopSalonDto
{
    public string SalonId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}
