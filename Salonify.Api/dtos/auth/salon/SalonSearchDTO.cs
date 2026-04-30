public class SalonSearchResultDto
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Name {get; set;}=string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public List<WorkingDays> WorkingHours { get; set; } = new();
    public List<WorkingDaysDTO> WorkingDays { get; set; } = new();
    public string? ImageUrl { get; set; }

    public List<SalonServiceResponseDTO> Services { get; set; } = new();
}