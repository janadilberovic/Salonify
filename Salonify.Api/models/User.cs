using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }


    public string Email { get; set; }

    public string DisplayName { get; set; }
    public string PasswordHash { get; set; }

    
    [BsonRepresentation(BsonType.String)]
    public UserRole Role { get; set; }

    
    public string? ProfileImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
