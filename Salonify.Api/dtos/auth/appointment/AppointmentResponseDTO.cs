public class AppointmentResponseDTO
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public string SalonId { get; set; }
    public string CustomerName { get; set; }
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public ServiceType ServiceType { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Note { get; set; }
    public AppointmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}