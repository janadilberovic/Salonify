using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

public class DateOnlySerializer : StructSerializerBase<DateOnly>
{
    private static readonly DateTime UnixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, DateOnly value)
    {
        context.Writer.WriteString(value.ToString("yyyy-MM-dd"));
    }

    public override DateOnly Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var bsonType = context.Reader.GetCurrentBsonType();

        return bsonType switch
        {
            BsonType.String => DateOnly.Parse(context.Reader.ReadString()),
            BsonType.DateTime => DateOnly.FromDateTime(UnixEpoch.AddMilliseconds(context.Reader.ReadDateTime())),
            _ => throw new BsonSerializationException($"Cannot deserialize DateOnly from {bsonType}")
        };
    }
}
