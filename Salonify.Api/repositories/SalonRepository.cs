using MongoDB.Driver;

namespace Salonify.Api.Repositories;

public class SalonRepository
{
    private readonly IMongoCollection<Salon> _salons;

    public SalonRepository(MongoDbContext context)
    {
        _salons = context.Salons;
    }
    private static SalonSearchResultDto MapToSearchResultDto(Salon s)
    {
        return new SalonSearchResultDto
        {
            Id = s.Id,
            UserId = s.UserId,
            Description = s.Description,
            Address = s.Address,
            City = s.City,
            Phone = s.Phone,
            ImageUrl = s.ImageUrl,
            WorkingDays = s.WorkingDays.Select(wd => new WorkingDaysDTO
            {
                Day = wd.Day.ToString(),
                StartTime = wd.StartTime?.ToString(@"hh\:mm"),
                EndTime = wd.EndTime?.ToString(@"hh\:mm"),
                IsClosed = wd.IsClosed
            }).ToList(),
            Services = s.Services.Select(serv => new SalonServiceResponseDTO
            {
                Name = serv.Name,
                Price = serv.Price,
                Description = serv.Description,
                ServiceType = serv.ServiceType,
                DurationMinutes = serv.DurationMinutes,
                ImageUrl = serv.ImageUrl
            }).ToList()
        };
    }
    public async Task<Salon?> GetBySalonIdAsync(string salonId)
    {
                return await _salons.Find(s => s.Id == salonId).FirstOrDefaultAsync();

    }
    public async Task<Salon?> GetByUserIdAsync(string userId)
    {
        return await _salons.Find(s => s.UserId == userId).FirstOrDefaultAsync();
    }

    public async Task UpdateSalonProfileAsync(string userId, UpdateSalonProfileRequest updateRequest)
    {
        var update = Builders<Salon>.Update
            .Set(s => s.Name, updateRequest.Name)
            .Set(s => s.Description, updateRequest.Description)
            .Set(s => s.Address, updateRequest.Address)
            .Set(s => s.City, updateRequest.City)
            .Set(s => s.Phone, updateRequest.Phone);
            
        await _salons.UpdateOneAsync(s => s.UserId == userId, update);
    }
    public async Task UpdateSalonWorkingDays(string userId,UpdateSalonWorkingDaysDto dto)
    {
        var update=Builders<Salon>.Update.Set(s => s.WorkingDays, dto.WorkingDays);
        
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
            .Set("Services.$.Description", updatedService.Description)
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
        return await _salons.Find(s => s.Id == salonId).FirstOrDefaultAsync();
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

    public async Task<List<Salon>> GetByCityAsync(string city)
    {
        if (string.IsNullOrWhiteSpace(city))
            return await _salons.Find(_ => true).ToListAsync();

        var normalizedCity = city.Trim().ToLower();

        return await _salons
            .Find(s => s.City.ToLower() == normalizedCity)
            .ToListAsync();
    }
    public async Task<List<Salon>> GetByServiceTypeAsync(string serviceType)
    {
        ServiceType parsedServiceType;
        if (!Enum.TryParse(serviceType, true, out parsedServiceType))
        {
            throw new ArgumentException("Neispravan tip usluge.");
        }
        var filter = Builders<Salon>.Filter.ElemMatch(
            s => s.Services,
            service => service.ServiceType == parsedServiceType
        );

        return await _salons.Find(filter).ToListAsync();
    }
    public async Task<List<Salon>> SearchByNameAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return await _salons.Find(_ => true).ToListAsync();

        var normalizedName = name.Trim().ToLower();

        return await _salons
            .Find(s => s.Name.ToLower().Contains(normalizedName))
            .ToListAsync();
    }

    public async Task<List<SalonSearchResultDto>> SearchByPrice(string serviceType, decimal? minPrice, decimal? maxPrice)
    {
        ServiceType parsedServiceType;
        if (!Enum.TryParse(serviceType, true, out parsedServiceType))
        {
            throw new ArgumentException("Neispravan tip usluge.");
        }
        var filter = Builders<Salon>.Filter.ElemMatch(
           s => s.Services,
           service =>
               service.ServiceType == parsedServiceType &&
               (!minPrice.HasValue || service.Price >= minPrice.Value) &&
               (!maxPrice.HasValue || service.Price <= maxPrice.Value)
       );

        //vracam salone koji zadovoljavaju ove kriterijume 
        var salons = await _salons.Find(filter).ToListAsync();

        var result = salons.Select(s => new SalonSearchResultDto
        {
            Id = s.Id,
            UserId = s.UserId,
            Description = s.Description,
            Address = s.Address,
            City = s.City,
            Phone = s.Phone,
            // WorkingHours = s.WorkingHours,
            ImageUrl = s.ImageUrl,
            Services = s.Services.Where(serv => serv.ServiceType == parsedServiceType)
                                .Select(serv => new SalonServiceResponseDTO
                                {
                                    Name = serv.Name,
                                    Price = serv.Price,
                                    Description = serv.Description,
                                    ServiceType = serv.ServiceType,
                                    DurationMinutes = serv.DurationMinutes,
                                    ImageUrl = serv.ImageUrl
                                }).ToList()
        }).ToList();

        Console.WriteLine($"Found {result.Count} salons matching criteria.");
        return result;


    }

    public async Task<List<SalonSearchResultDto>> SearchByWorkingDays(int day, string startTime, string endTime)
    {
        if (day < 0 || day > 6)
            throw new ArgumentException("Dan mora biti između 0 i 6.");

        var selectedDay = (DayOfWeek)day;

        FilterDefinition<Salon> filter;

        if (string.IsNullOrWhiteSpace(startTime) || string.IsNullOrWhiteSpace(endTime))
        {
            filter = Builders<Salon>.Filter.ElemMatch(
                s => s.WorkingDays,
                wd => wd.Day == selectedDay && !wd.IsClosed
            );
        }
        else
        {
            if (!TimeSpan.TryParse(startTime, out var targetStartTime) || !TimeSpan.TryParse(endTime, out var targetEndTime))
                throw new ArgumentException("Neispravan format vremena. Koristi HH:mm:ss.");

            filter = Builders<Salon>.Filter.ElemMatch(
                s => s.WorkingDays,
                wd =>
                    wd.Day == selectedDay &&
                    !wd.IsClosed &&
                    wd.StartTime.HasValue &&
                    wd.EndTime.HasValue &&
                    wd.StartTime.Value <= targetStartTime &&
                    wd.EndTime.Value >= targetEndTime
            );
        }

        var result = await _salons.Find(filter).ToListAsync();

        return result.Select(s => new SalonSearchResultDto
        {
            Id = s.Id,
            UserId = s.UserId,
            Description = s.Description,
            Address = s.Address,
            City = s.City,
            Phone = s.Phone,
            WorkingHours = s.WorkingDays,
            ImageUrl = s.ImageUrl,
            Services = s.Services.Select(serv => new SalonServiceResponseDTO
            {
                Name = serv.Name,
                Price = serv.Price,
                Description = serv.Description,
                ServiceType = serv.ServiceType,
                DurationMinutes = serv.DurationMinutes,
                ImageUrl = serv.ImageUrl
            }).ToList()
        }).ToList();
    }
    public async Task<List<SalonSearchResultDto>> OpenNow(string city)
    {
        var now = DateTime.Now;
        var currentDay = now.DayOfWeek;
        var currentTime = now.TimeOfDay;

        FilterDefinition<Salon> filter;

        if (string.IsNullOrWhiteSpace(city))
        {
            filter = Builders<Salon>.Filter.ElemMatch(
                s => s.WorkingDays,
                wd =>
                    wd.Day == currentDay &&
                    !wd.IsClosed &&
                    wd.StartTime.HasValue &&
                    wd.EndTime.HasValue &&
                    wd.StartTime.Value <= currentTime &&
                    wd.EndTime.Value >= currentTime
            );
        }
        else
        {
            var normalizedCity = city.Trim().ToLower();

            filter = Builders<Salon>.Filter.And(
    Builders<Salon>.Filter.Regex(
        s => s.City,
        new MongoDB.Bson.BsonRegularExpression($"^{normalizedCity}$", "i")
    ),
    Builders<Salon>.Filter.ElemMatch(
        s => s.WorkingDays,
        wd =>
            wd.Day == currentDay &&
            !wd.IsClosed &&
            wd.StartTime.HasValue &&
            wd.EndTime.HasValue &&
            wd.StartTime.Value <= currentTime &&
            wd.EndTime.Value >= currentTime
    )
);
        }

        var result = await _salons.Find(filter).ToListAsync();

        return result.Select(s => new SalonSearchResultDto
        {
            Id = s.Id,
            UserId = s.UserId,
            Description = s.Description,
            Address = s.Address,
            City = s.City,
            Phone = s.Phone,
            WorkingHours = s.WorkingDays,
            ImageUrl = s.ImageUrl,
            Services = s.Services.Select(serv => new SalonServiceResponseDTO
            {
                Name = serv.Name,
                Price = serv.Price,
                Description = serv.Description,
                ServiceType = serv.ServiceType,
                DurationMinutes = serv.DurationMinutes,
                ImageUrl = serv.ImageUrl
            }).ToList()
        }).ToList();

    }
    //svi filteri
    public async Task<List<SalonSearchResultDto>> SearchAsync(
    string? city,
    string? serviceType,
    decimal? minPrice,
    decimal? maxPrice,
    int? day,
    string? time)
    {
        if (minPrice.HasValue && maxPrice.HasValue && minPrice > maxPrice)
            throw new ArgumentException("Minimalna cena ne može biti veća od maksimalne.");

        var filters = new List<FilterDefinition<Salon>>();
        ServiceType? parsedServiceType = null;

        if (!string.IsNullOrWhiteSpace(city))
        {
            var normalizedCity = city.Trim();

            filters.Add(
                Builders<Salon>.Filter.Regex(
                    s => s.City,
                    new MongoDB.Bson.BsonRegularExpression(
                        $"^{System.Text.RegularExpressions.Regex.Escape(normalizedCity)}$", "i")
                )
            );
        }

        if (!string.IsNullOrWhiteSpace(serviceType))
        {
            if (!Enum.TryParse(serviceType, true, out ServiceType parsed))
                throw new ArgumentException("Neispravan tip usluge.");

            parsedServiceType = parsed;

            filters.Add(
                Builders<Salon>.Filter.ElemMatch(
                    s => s.Services,
                    serv =>
                        serv.ServiceType == parsed &&
                        (!minPrice.HasValue || serv.Price >= minPrice.Value) &&
                        (!maxPrice.HasValue || serv.Price <= maxPrice.Value)
                )
            );
        }
        else if (minPrice.HasValue || maxPrice.HasValue)
        {
            filters.Add(
                Builders<Salon>.Filter.ElemMatch(
                    s => s.Services,
                    serv =>
                        (!minPrice.HasValue || serv.Price >= minPrice.Value) &&
                        (!maxPrice.HasValue || serv.Price <= maxPrice.Value)
                )
            );
        }

        if (day.HasValue)
        {
            if (day < 0 || day > 6)
                throw new ArgumentException("Dan mora biti između 0 i 6.");

            var selectedDay = (DayOfWeek)day.Value;

            if (!string.IsNullOrWhiteSpace(time))
            {
                if (!TimeSpan.TryParse(time, out var targetTime))
                    throw new ArgumentException("Neispravan format vremena. Koristi HH:mm:ss.");

                filters.Add(
                    Builders<Salon>.Filter.ElemMatch(
                        s => s.WorkingDays,
                        wd =>
                            wd.Day == selectedDay &&
                            !wd.IsClosed &&
                            wd.StartTime.HasValue &&
                            wd.EndTime.HasValue &&
                            wd.StartTime.Value <= targetTime &&
                            wd.EndTime.Value >= targetTime
                    )
                );
            }
            else
            {
                filters.Add(
                    Builders<Salon>.Filter.ElemMatch(
                        s => s.WorkingDays,
                        wd => wd.Day == selectedDay && !wd.IsClosed
                    )
                );
            }
        }

        var finalFilter = filters.Any()
            ? Builders<Salon>.Filter.And(filters)
            : Builders<Salon>.Filter.Empty;

        var salons = await _salons.Find(finalFilter).ToListAsync();

        return salons.Select(s => new SalonSearchResultDto
        {
            Id = s.Id,
            UserId = s.UserId,
            Description = s.Description,
            Address = s.Address,
            City = s.City,
            Phone = s.Phone,
            ImageUrl = s.ImageUrl,
            WorkingDays = s.WorkingDays.Select(wd => new WorkingDaysDTO
            {
                Day = wd.Day.ToString(),
                StartTime = wd.StartTime?.ToString(@"hh\:mm"),
                EndTime = wd.EndTime?.ToString(@"hh\:mm"),
                IsClosed = wd.IsClosed
            }).ToList(),
            Services = s.Services
                .Where(serv =>
                    (!parsedServiceType.HasValue || serv.ServiceType == parsedServiceType.Value) &&
                    (!minPrice.HasValue || serv.Price >= minPrice.Value) &&
                    (!maxPrice.HasValue || serv.Price <= maxPrice.Value))
                .Select(serv => new SalonServiceResponseDTO
                {
                    Name = serv.Name,
                    Price = serv.Price,
                    Description = serv.Description,
                    ServiceType = serv.ServiceType,
                    DurationMinutes = serv.DurationMinutes,
                    ImageUrl = serv.ImageUrl
                }).ToList()
        }).ToList();
    }
    public async Task AddGalleryImageAsync(string salonId, string imageUrl)
{
    var update = Builders<Salon>.Update.Push(s => s.GalleryImageUrls, imageUrl);

    await _salons.UpdateOneAsync(s => s.UserId == salonId, update);
}
public async Task RemoveGalleryImageAsync(string salonId, string imageUrl)
{
    var update = Builders<Salon>.Update.Pull(s => s.GalleryImageUrls, imageUrl);

    await _salons.UpdateOneAsync(s => s.Id == salonId, update);
}
public async Task<Salon?> GetBySlugAsync(string slug)
{
    return await _salons.Find(s => s.Slug == slug).FirstOrDefaultAsync();
}
    
}


