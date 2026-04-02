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
    public string SalonId { get; set; }
    [BsonRepresentation(BsonType.String)]
    public ServiceType ServiceType { get; set; }

    // Datum i vreme termina
    public DateTime AppointmentDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public string? Note { get; set; }

    // Status termina
    [BsonRepresentation(BsonType.String)]
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
