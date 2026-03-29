using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Review
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    // Korisnik koji ostavlja ocenu
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; }

    // Salon koji se ocenjuje (User sa Role = Salon)
    [BsonRepresentation(BsonType.ObjectId)]
    public string SalonUserId { get; set; }

    // Ocena (1–5)
    public int Rating { get; set; }

    // Tekstualni komentar
    public string Comment { get; set; }

    // Opciono – slika koju korisnik dodaje uz recenziju
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
