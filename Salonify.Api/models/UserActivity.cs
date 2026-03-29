using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class UserActivity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string? SalonUserId { get; set; }

    [BsonRepresentation(BsonType.String)]
    public ServiceType ServiceType { get; set; }

    public double Weight { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
