public class AppointmentResponseDTO
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public string SalonId { get; set; }
    public ServiceType ServiceType { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Note { get; set; }
    public AppointmentStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}