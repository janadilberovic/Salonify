using MongoDB.Driver;

public class MongoDbContext
{
     private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetSection("MongoDbSettings:ConnectionString").Value;
        var databaseName = configuration.GetSection("MongoDbSettings:DatabaseName").Value;

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
        Console.WriteLine("MongoDB connected to database: " + databaseName);

    }


    public IMongoCollection<User> Users =>
        _database.GetCollection<User>("Users");

    public IMongoCollection<Salon> Salons =>
        _database.GetCollection<Salon>("Salons");
    public IMongoCollection<SalonService> SalonServices =>
        _database.GetCollection<SalonService>("SalonServices");

    public IMongoCollection<Appointment> Appointments =>
        _database.GetCollection<Appointment>("Appointments");

    public IMongoCollection<Review> Reviews =>
        _database.GetCollection<Review>("Reviews");

    public IMongoCollection<UserActivity> UserActivities =>
        _database.GetCollection<UserActivity>("UserActivities");

    
}
