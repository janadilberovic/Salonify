using MongoDB.Driver;

public class UserRepository
{
    private readonly IMongoCollection<User> _users;

    public UserRepository(MongoDbContext context)
    {
        _users = context.Users;
    }

   
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _users
            .Find(u => u.Email == email)
            .FirstOrDefaultAsync();
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _users
            .Find(u => u.Id == id)
            .FirstOrDefaultAsync();
    }

    public async Task CreateAsync(User user)
    {
        await _users.InsertOneAsync(user);
    }

    public async Task IncrementPreferenceAsync(string userId, string featureKey, double amount)
    {
        var update = Builders<User>.Update.Inc($"PreferenceVector.{featureKey}", amount);

        await _users.UpdateOneAsync(u => u.Id == userId, update);
    }

    public async Task IncrementPreferencesAsync(string userId, Dictionary<string, double> preferences)
    {
        if (preferences.Count == 0)
            return;

        var updates = preferences
            .Select(x => Builders<User>.Update.Inc($"PreferenceVector.{x.Key}", x.Value))
            .ToList();

        await _users.UpdateOneAsync(
            u => u.Id == userId,
            Builders<User>.Update.Combine(updates)
        );
    }

    public async Task UpdateContactAsync(string userId, string displayName, string phone)
    {
        var update = Builders<User>.Update
            .Set(u => u.DisplayName, displayName)
            .Set(u => u.Phone, phone);

        await _users.UpdateOneAsync(u => u.Id == userId, update);
    }
}
