using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Salon
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    // Referenca na User (Role = Salon)
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; }


    // Opis salona
    public string Description { get; set; }
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string WorkingHours { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }
    // Lista usluga koje salon nudi
    public List<SalonService> Services { get; set; } = new();

}
