using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public class Appointment
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    // Korisnik koji zakazuje termin
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; }

    // Salon
    [BsonRepresentation(BsonType.ObjectId)]
    public string SalonUserId { get; set; }

    // Datum i vreme termina
    public DateTime Date { get; set; }

    // Status termina
    [BsonRepresentation(BsonType.String)]
    public AppointmentStatus Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
