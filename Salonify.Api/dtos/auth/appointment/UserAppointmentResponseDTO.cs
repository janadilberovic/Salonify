public class UserAppointmentResponseDTO
{
    public string Id { get; set; }
    public string SalonId { get; set; }
    public string SalonName { get; set; }
    public string SalonImageUrl { get; set; }
    public ServiceType ServiceType { get; set; }
        public string? ServiceImageUrl{get; set;}

    public decimal Price { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Note { get; set; }
    public AppointmentStatus Status { get; set; }
    public string Slug { get; set; }
}