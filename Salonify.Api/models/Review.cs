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
    public string SalonId { get; set; }
     // Termin/tretman za koji je ostavljena recenzija
    [BsonRepresentation(BsonType.ObjectId)]
    public string AppointmentId { get; set; } = string.Empty;

    public string ServiceName { get; set; } = string.Empty;
    // Ocena (1–5)
    public int Rating { get; set; }

    // Tekstualni komentar
    public string Comment { get; set; }
    public ServiceType ServiceType{get; set;}



    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
