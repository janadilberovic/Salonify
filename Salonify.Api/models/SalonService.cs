using MongoDB.Bson.Serialization.Attributes;

public class SalonService
{
    [BsonRepresentation(MongoDB.Bson.BsonType.String)]
    public ServiceType ServiceType { get; set; }
    public string Name{ get; set; }
    public string Description { get; set; }

    public decimal Price { get; set; }

    public int DurationMinutes { get; set; }

    public string ImageUrl { get; set; }
}
