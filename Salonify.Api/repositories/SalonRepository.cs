using MongoDB.Driver;

namespace Salonify.Api.Repositories;

public class SalonRepository
{
    private readonly IMongoCollection<Salon> _salons;

    public SalonRepository(MongoDbContext context)
    {
        _salons = context.Salons;
    }

    public async Task<Salon?> GetByUserIdAsync(string userId)
    {
        return await _salons.Find(s => s.UserId == userId).FirstOrDefaultAsync();
    }

    public async Task UpdateSalonProfileAsync(string userId, UpdateSalonProfileRequest updateRequest)
    {
        var update = Builders<Salon>.Update
            .Set("Description", updateRequest.Description)
            .Set("address", updateRequest.Address)
            .Set("city", updateRequest.City)
            .Set("phone", updateRequest.Phone)
            .Set("workingHours", updateRequest.WorkingHours);

        await _salons.UpdateOneAsync(s => s.UserId == userId, update);
    }
    public async Task UpdateImageAsync(string userId, string imageUrl)
{
    var update = Builders<Salon>.Update
        .Set("imageUrl", imageUrl);

    await _salons.UpdateOneAsync(
        s => s.UserId == userId,
        update
    );
}
public async Task<List<Salon>> GetAllAsync()
{
    return await _salons.Find(_ => true).ToListAsync();
}

}
