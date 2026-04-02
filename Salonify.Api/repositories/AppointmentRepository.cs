using MongoDB.Driver;

namespace Salonify.Api.Repositories;

public class AppointmentRepository
{
    private readonly IMongoCollection<Appointment> _appointments;

    public AppointmentRepository(MongoDbContext context)
    {
        _appointments = context.Appointments;
    }

    public async Task<Appointment?> GetByIdAsync(string id)
    {
        return await _appointments.Find(a => a.Id == id).FirstOrDefaultAsync();
    }

    public async Task CreateAsync(Appointment appointment)
    {
        await _appointments.InsertOneAsync(appointment);
    }

    public async Task UpdateAsync(Appointment appointment)
    {
        await _appointments.ReplaceOneAsync(a => a.Id == appointment.Id, appointment);
    }

    public async Task DeleteAsync(string id)
    {
        await _appointments.DeleteOneAsync(a => a.Id == id);
    }

    public async Task<List<Appointment>> GetAllAsync()
    {
        return await _appointments.Find(_ => true).ToListAsync();
    }

    public async Task<List<Appointment>> GetByUserIdAsync(string userId)
    {
        return await _appointments.Find(a => a.UserId == userId).ToListAsync();
    }

    public async Task<List<Appointment>> GetBySalonIdAsync(string salonId)
    {
        return await _appointments.Find(a => a.SalonId == salonId).ToListAsync();
    }

    public async Task<List<Appointment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _appointments.Find(a => a.AppointmentDate >= startDate && a.AppointmentDate <= endDate).ToListAsync();
    }

    public async Task<bool> HasConflictAsync(string salonId, DateTime appointmentDate, TimeSpan startTime, TimeSpan endTime)
    {
        return await _appointments.Find(a =>
        a.SalonId == salonId &&
        a.AppointmentDate.Date == appointmentDate.Date &&
        a.Status != AppointmentStatus.Cancelled &&
        a.Status != AppointmentStatus.Rejected &&
        startTime < a.EndTime &&
        endTime > a.StartTime
    ).AnyAsync();
    }
    public async Task UpdateStatusAsync(string appointmentId, AppointmentStatus status)
    {
        var update = Builders<Appointment>.Update.Set(a => a.Status, status);
        await _appointments.UpdateOneAsync(a => a.Id == appointmentId, update);
    }
    //termini za odredjeni salon za datum koji su aktivni
    public async Task<List<Appointment>> GetSalonAppointmentsByDateAsync(string salonId, DateTime date)
    {
        return await _appointments.Find(a =>
            a.SalonId == salonId &&
            a.AppointmentDate.Date == date.Date &&
            a.Status != AppointmentStatus.Cancelled &&
            a.Status != AppointmentStatus.Rejected
        ).ToListAsync();
    }

    //termini koji su slobodni za odredjeni salon za datum
    public async Task<List<Appointment>> GetAvailableSalonAppointmentsByDateAsync(string salonId, DateTime date)
    {
        return await _appointments.Find(a =>
            a.SalonId == salonId &&
            a.AppointmentDate.Date == date.Date &&
            a.Status == AppointmentStatus.Approved
        ).ToListAsync();
    }
    //svi saloni koji imaju termine za odredjeni datum
    public async Task<List<string>> GetSalonsWithAppointmentsByDateAsync(DateTime date, TimeSpan startTime, TimeSpan endTime)
    {
        var startofDay = date.Date;
        var endOfDay = date.Date.AddDays(1).AddTicks(-1);
        var filter = Builders<Appointment>.Filter.And(
        Builders<Appointment>.Filter.Gte(a => a.AppointmentDate, startofDay),
        Builders<Appointment>.Filter.Lt(a => a.AppointmentDate, endOfDay),
        Builders<Appointment>.Filter.Ne(a => a.Status, AppointmentStatus.Cancelled),
        Builders<Appointment>.Filter.Ne(a => a.Status, AppointmentStatus.Rejected),
        Builders<Appointment>.Filter.Where(a =>
            startTime < a.EndTime && endTime > a.StartTime
        )
    );

        return await _appointments
            .Distinct<string>("SalonId", filter)
            .ToListAsync();
    }

}