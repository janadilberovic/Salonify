public class ReviewResponseDTO
{
    public string Id { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; }
    public DateTime CreatedAt { get; set; }

    public string UserName { get; set; }
    public string ServiceName { get; set; }

    public string? ImageUrl { get; set; }
}