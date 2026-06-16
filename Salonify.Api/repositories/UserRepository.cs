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
        var user = await GetByIdAsync(userId);

        if (user == null)
            return;

        var preferenceVector = NormalizePreferenceVector(user.PreferenceVector);
        preferenceVector.TryGetValue(featureKey, out var currentValue);
        preferenceVector[featureKey] = Math.Min(currentValue + amount, 1.0);

        var update = Builders<User>.Update
            .Set(x => x.PreferenceVector, preferenceVector);

        await _users.UpdateOneAsync(u => u.Id == userId, update);
    }

    public async Task IncrementPreferencesAsync(string userId, Dictionary<string, double> preferences)
    {
        if (preferences.Count == 0)
            return;

        var user = await GetByIdAsync(userId);

        if (user == null)
            return;

        var preferenceVector = NormalizePreferenceVector(user.PreferenceVector);

        foreach (var preference in preferences)
        {
            preferenceVector.TryGetValue(preference.Key, out var currentValue);
            preferenceVector[preference.Key] = Math.Min(currentValue + preference.Value, 1.0);
        }

        var update = Builders<User>.Update
            .Set(x => x.PreferenceVector, preferenceVector);

        await _users.UpdateOneAsync(u => u.Id == userId, update);
    }

    public async Task NormalizePreferenceVectorAsync(string userId)
    {
        var user = await GetByIdAsync(userId);

        if (user == null)
            return;

        var update = Builders<User>.Update
            .Set(x => x.PreferenceVector, NormalizePreferenceVector(user.PreferenceVector));

        await _users.UpdateOneAsync(u => u.Id == userId, update);
    }

    public async Task NormalizeAllPreferenceVectorsAsync()
    {
        var users = await _users.Find(_ => true).ToListAsync();

        foreach (var user in users)
        {
            var update = Builders<User>.Update
                .Set(x => x.PreferenceVector, NormalizePreferenceVector(user.PreferenceVector));

            await _users.UpdateOneAsync(u => u.Id == user.Id, update);
        }
    }

    public async Task UpdateContactAsync(string userId, string displayName, string phone)
    {
        var update = Builders<User>.Update
            .Set(u => u.DisplayName, displayName)
            .Set(u => u.Phone, phone);

        await _users.UpdateOneAsync(u => u.Id == userId, update);
    }

    private static Dictionary<string, double> NormalizePreferenceVector(
        Dictionary<string, double>? preferenceVector)
    {
        if (preferenceVector == null || preferenceVector.Count == 0)
            return new Dictionary<string, double>();

        var positivePreferences = preferenceVector
            .Where(x => x.Value > 0)
            .ToDictionary(x => x.Key, x => x.Value);

        if (positivePreferences.Count == 0)
            return new Dictionary<string, double>();

        var maxValue = positivePreferences.Values.Max();

        if (maxValue <= 1.0)
        {
            return positivePreferences
                .ToDictionary(x => x.Key, x => Math.Clamp(x.Value, 0.0, 1.0));
        }

        return positivePreferences
            .ToDictionary(x => x.Key, x => Math.Clamp(x.Value / maxValue, 0.0, 1.0));
    }
}
