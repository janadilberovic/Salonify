
public class WorkingDays
{
    public DayOfWeek Day { get; set; }
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public bool IsClosed { get; set; }
}