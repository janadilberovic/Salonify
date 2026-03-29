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
        .Set(s => s.Description, updateRequest.Description)
        .Set(s => s.Address, updateRequest.Address)
        .Set(s => s.City, updateRequest.City)
        .Set(s => s.Phone, updateRequest.Phone)
        .Set(s => s.WorkingHours, updateRequest.WorkingHours);

    await _salons.UpdateOneAsync(s => s.UserId == userId, update);
}

public async Task UpdateImageAsync(string userId, string imageUrl)
{
    var update = Builders<Salon>.Update
        .Set(s => s.ImageUrl, imageUrl);

    await _salons.UpdateOneAsync(s => s.UserId == userId, update);
}
public async Task<List<Salon>> GetAllAsync()
{
    return await _salons.Find(_ => true).ToListAsync();
}
public async Task AddServiceAsync(string userId, SalonService service)
{
    var update = Builders<Salon>.Update
        .Push(s => s.Services, service);

    await _salons.UpdateOneAsync(s => s.UserId == userId, update);
}
public async Task RemoveServiceAsync(string userId, ServiceType serviceType)
{
    var update = Builders<Salon>.Update
        .PullFilter(s => s.Services, srv => srv.ServiceType == serviceType);

    await _salons.UpdateOneAsync(s => s.UserId == userId, update);

}
public async Task UpdateServiceAsync(string userId, SalonService updatedService)
{
    var filter = Builders<Salon>.Filter.And(
        Builders<Salon>.Filter.Eq(s => s.UserId, userId),
        Builders<Salon>.Filter.ElemMatch(
            s => s.Services,
            srv => srv.ServiceType == updatedService.ServiceType
        )
    );

    var update = Builders<Salon>.Update
        .Set("Services.$.Name", updatedService.Name)
        .Set("Services.$.Price", updatedService.Price)
        .Set("Services.$.DurationMinutes", updatedService.DurationMinutes)
        .Set("Services.$.ImageUrl", updatedService.ImageUrl);

    var result = await _salons.UpdateOneAsync(filter, update);

    if (result.MatchedCount == 0)
        throw new Exception("Usluga nije pronađena.");
}

public async Task<Salon?> GetByIdAsync(string salonId)
    {
        return await _salons.Find(s=> s.Id==salonId).FirstOrDefaultAsync();
    }

public async Task DeleteAsync(string salonId)
    {
        await _salons.DeleteOneAsync(s => s.Id == salonId); 
    }
public async Task<List<SalonService>> GetServicesAsync(string salonId)
{
    var salon = await _salons.Find(s => s.Id == salonId).FirstOrDefaultAsync();
    return salon?.Services ?? new List<SalonService>();
}

}



