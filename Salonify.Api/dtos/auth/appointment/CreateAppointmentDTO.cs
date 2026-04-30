public class CreateAppointmentDTO
{
   
    public string SalonId { get; set; }
    public ServiceType ServiceType { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public string StartTime { get; set; }

    public decimal DurationMinutes{get; set;}
    public string? Note { get; set; }
}