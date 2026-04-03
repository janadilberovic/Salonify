public class CreateAppointmentDTO
{
   
    public string SalonId { get; set; }
    public ServiceType ServiceType { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string StartTime { get; set; }

    public decimal DurationMinutes{get; set;}
    public string? Note { get; set; }
}