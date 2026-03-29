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
}
