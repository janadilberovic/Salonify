public class CreateReviewDto
{
      public string AppointmentId { get; set; } = string.Empty;
  
    public int Rating { get; set; }
    public string? Comment { get; set; }
}