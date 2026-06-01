using MongoDB.Driver;

public class UserActivityRepository
{
    private readonly IMongoCollection<UserActivity> _userActivities;

    public UserActivityRepository(MongoDbContext context)
    {
        _userActivities = context.UserActivities;
    }

    public async Task CreateAsync(UserActivity activity)
    {
        await _userActivities.InsertOneAsync(activity);
    }

    public async Task<List<UserActivity>> GetByUserIdAsync(string userId)
    {
        return await _userActivities
            .Find(x => x.UserId == userId)
            .ToListAsync();
    }
}
