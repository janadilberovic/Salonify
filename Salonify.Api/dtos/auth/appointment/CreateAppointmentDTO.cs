public class CreateAppointmentDTO
{
    public string UserId { get; set; }
    public string SalonId { get; set; }
    public ServiceType ServiceType { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan StartTime { get; set; }

    public string? Note { get; set; }
}