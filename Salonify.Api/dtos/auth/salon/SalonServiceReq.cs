using Microsoft.AspNetCore.Http;

public class SalonServiceReq
{   

    public decimal Price { get; set; }
    public string Description { get; set; }
    public ServiceType ServiceType { get; set; }
    public int DurationMinutes { get; set; }

    public IFormFile? Image { get; set; } //za upload slike
}