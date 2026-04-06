using MongoDB.Driver;

namespace Salonify.Api.Repositories;

public class ReviewRepository
{
    private readonly IMongoCollection<Review> _reviews;

    public ReviewRepository(MongoDbContext context)
    {
        _reviews = context.Reviews;
    }

    //CRUD
    public async Task<Review?> GetByIdAsync(string id)
    {
        return await _reviews.Find(a => a.Id == id).FirstOrDefaultAsync();
    }

    public async Task CreateReview(Review review)
    {
        await _reviews.InsertOneAsync(review);
    }

    public async Task UpdateReviewAsync(Review review)
    {
        await _reviews.ReplaceOneAsync(a => a.Id == review.Id, review);
    }

    public async Task DeleteReviewAsync(string id)
    {
        await _reviews.DeleteOneAsync(a => a.Id == id);
    }

    public async Task<List<Review>> GetAllAsync()
    {
        return await _reviews.Find(_ => true).ToListAsync();
    }

    //get reviews by user
    public async Task<List<Review>> GetReviewsByUser(string userId)
    {
        return await _reviews.Find(a => a.UserId == userId).SortByDescending(r=>r.CreatedAt).ToListAsync();
    }
    //get reviews by salon
    public async Task<List<Review>> GetReviewsBySalon(string salonId)
    {
        return await _reviews.Find(a => a.SalonId == salonId).SortByDescending(r=>r.CreatedAt).ToListAsync();
    }

    public async Task<Review?> GetByUserAndSalon(string userID, string salonID)
    {
        return await _reviews.Find(a => a.SalonId == salonID && a.UserId == userID).FirstOrDefaultAsync();
    }

    //average rating
    public async Task<double?> GetAverageRatingForSalon(string salonId)
    {
        var reviews = await _reviews.Find(a => a.SalonId == salonId).ToListAsync();

        if (!reviews.Any())
            return 0;
        return reviews.Average(r => r.Rating);
    }
    public async Task<int> GetReviewCountForSalon(string salonId)
    {
        return (int)await _reviews.CountDocumentsAsync(r => r.SalonId == salonId);
    }
}