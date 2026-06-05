using MongoDB.Driver;

namespace Salonify.Api.Repositories;

public class ReviewRepository
{
    private readonly IMongoCollection<Review> _reviews;
    private readonly IMongoCollection<User> _users;
    private readonly IMongoCollection<Appointment> _appointments;
    private readonly IMongoCollection<Salon> _salons;

    public ReviewRepository(MongoDbContext context)
    {
        _reviews = context.Reviews;
        _users = context.Users;
        _appointments = context.Appointments;
        _salons = context.Salons;
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
        return await _reviews.Find(a => a.UserId == userId).SortByDescending(r => r.CreatedAt).ToListAsync();
    }
    //get reviews by salon
    public async Task<List<ReviewResponseDTO>> GetReviewsBySalon(string salonId)
    {
        var reviews = await _reviews.Find(a => a.SalonId == salonId).SortByDescending(r => r.CreatedAt).ToListAsync();
        return await MapToResponseDtosAsync(reviews);
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

        return Math.Round(reviews.Average(r => r.Rating), 2);
    }
    public async Task<int> GetReviewCountForSalon(string salonId)
    {
        return (int)await _reviews.CountDocumentsAsync(r => r.SalonId == salonId);
    }
    public async Task<Review?> GetByAppointmentIdAsync(string appointmentId)
    {
        var review = await _reviews.Find(a => a.AppointmentId == appointmentId).FirstOrDefaultAsync();
        return review;
    }
    public async Task<Review?> GetByUserSalonAndServiceAsync(
    string userId,
    string salonId,
    string serviceName)
    {
        return await _reviews
            .Find(r =>
                r.UserId == userId &&
                r.SalonId == salonId &&
                r.ServiceName == serviceName)
            .FirstOrDefaultAsync();
    }
    public async Task<bool> ExistsForAppointmentAsync(string userId, string appointmentId)
    {
        return await _reviews
            .Find(r => r.UserId == userId && r.AppointmentId == appointmentId)
            .AnyAsync();
    }
    public async Task<bool> ExistsForSalonServiceAsync(
        string userId,
        string salonId,
        ServiceType serviceType)
    {
        return await _reviews
            .Find(r =>
                r.UserId == userId &&
                r.SalonId == salonId &&
                r.ServiceType == serviceType)
            .AnyAsync();
    }
    public async Task<List<ReviewResponseDTO>> SearchForSalonAsync(
    string salonId,
    int? minRating,
    ServiceType? serviceType,
    string? sortBy
)
    {
         var filterBuilder = Builders<Review>.Filter;

    var filter = filterBuilder.Eq(r => r.SalonId, salonId);

    if (minRating.HasValue)
    {
        filter &= filterBuilder.Gte(r => r.Rating, minRating.Value);
    }

    if (serviceType.HasValue)
    {
        filter &= filterBuilder.Eq(r => r.ServiceType, serviceType.Value);
    }

    var query = _reviews.Find(filter);

    query = sortBy switch
    {
        "oldest" => query.SortBy(r => r.CreatedAt),
        "highest" => query.SortByDescending(r => r.Rating),
        "lowest" => query.SortBy(r => r.Rating),
        _ => query.SortByDescending(r => r.CreatedAt)
    };

    var reviews = await query.ToListAsync();
    return await MapToResponseDtosAsync(reviews);
    }

    private async Task<List<ReviewResponseDTO>> MapToResponseDtosAsync(List<Review> reviews)
    {
        var result = new List<ReviewResponseDTO>();

        foreach (var review in reviews)
        {
            var user = await _users.Find(u => u.Id == review.UserId).FirstOrDefaultAsync();
            var serviceName = review.ServiceName;

            if (string.IsNullOrWhiteSpace(serviceName) && !string.IsNullOrWhiteSpace(review.AppointmentId))
            {
                var appointment = await _appointments
                    .Find(a => a.Id == review.AppointmentId)
                    .FirstOrDefaultAsync();

                serviceName = appointment?.ServiceName ?? string.Empty;
            }

            if (string.IsNullOrWhiteSpace(serviceName))
            {
                var salon = await _salons
                    .Find(s => s.Id == review.SalonId)
                    .FirstOrDefaultAsync();

                serviceName = salon?.Services
                    .FirstOrDefault(service => service.ServiceType == review.ServiceType)
                    ?.Name ?? string.Empty;
            }

            result.Add(new ReviewResponseDTO
            {
                Id = review.Id,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                AppointmentId = review.AppointmentId,
                UserName = user != null ? user.DisplayName : "Korisnik",
                ServiceName = serviceName,
                ServiceType = review.ServiceType
            });
        }

        return result;
    }
}
