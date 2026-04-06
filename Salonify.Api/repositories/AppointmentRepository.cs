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
        var dayStart = appointmentDate.Date;
        var dayEnd = dayStart.AddDays(1);

        var appointments = await _appointments.Find(a =>
            a.AppointmentDate >= dayStart &&
            a.AppointmentDate < dayEnd &&
            a.Status != AppointmentStatus.Approved &&
            a.Status != AppointmentStatus.Rejected
        ).ToListAsync();

        var salonAppointments = appointments
            .Where(a => a.SalonId == salonId)
            .ToList();

        Console.WriteLine($"PROVERA ZA SLOT: {startTime} - {endTime}");
        Console.WriteLine($"TERMINA ZA SALON: {salonAppointments.Count}");

        foreach (var a in salonAppointments)
        {
            var cond1 = startTime < a.EndTime;
            var cond2 = endTime > a.StartTime;
            var conflict = cond1 && cond2;

            Console.WriteLine($"POSTOJECI: {a.StartTime} - {a.EndTime}");
            Console.WriteLine($"startTime < a.EndTime = {cond1}");
            Console.WriteLine($"endTime > a.StartTime = {cond2}");
            Console.WriteLine($"KONFLIKT = {conflict}");
        }

        return salonAppointments.Any(a =>
            startTime < a.EndTime &&
            endTime > a.StartTime
        );
    }
    public async Task UpdateStatusAsync(string appointmentId, AppointmentStatus status)
    {
        var update = Builders<Appointment>.Update.Set(a => a.Status, status);
        await _appointments.UpdateOneAsync(a => a.Id == appointmentId, update);
    }
    //termini za odredjeni salon za datum koji su aktivni
    public async Task<List<Appointment>> GetSalonAppointmentsByDateAsync(string salonId, DateTime date)
    {
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        return await _appointments.Find(a =>
            a.SalonId == salonId &&
            a.AppointmentDate >= startOfDay &&
            a.AppointmentDate < endOfDay &&
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
            a.Status != AppointmentStatus.Approved
        ).ToListAsync();
    }

    public async Task<List<Appointment>> GetAppointmentByStatus(string salonId,AppointmentStatus status)
    {
        return await _appointments.Find(a=> a.SalonId==salonId &&
                              a.Status==status ).ToListAsync();
    }
    public async Task<List<Appointment>> GetUpcomingAppointmentsForSalon(string salonid)
    {
        var today=DateTime.UtcNow.Date;
        return await _appointments.Find(a=> a.SalonId==salonid && a.AppointmentDate>=today).ToListAsync();
    }
    public async Task<List<Appointment>> GetUpcomingAppointmentsForUser(string userId)
    {
        var today=DateTime.UtcNow.Date;
        return await _appointments.Find(a=> a.UserId==userId && a.AppointmentDate>=today).ToListAsync();
    }
    //history 
     public async Task<List<Appointment>> GetHistoryForSalon(string salonid)
    {
        var today=DateTime.UtcNow.Date;
        return await _appointments.Find(a=> a.SalonId==salonid && a.AppointmentDate<=today).ToListAsync();
    }
    public async Task<List<Appointment>> GetHistoryForUser(string userId)
    {
        var today=DateTime.UtcNow.Date;
        return await _appointments.Find(a=> a.UserId==userId && a.AppointmentDate<=today).ToListAsync();
    }
    //zavrsenu uslugu 
    public async Task<Appointment?> GetCompletedAppointmentForUserAndSalon(string userId,string salonID)
    {
        return await _appointments.Find( a=>
                                        a.UserId==userId &&
                                        a.SalonId==salonID &&
                                        a.Status==AppointmentStatus.Completed)
                                        .FirstOrDefaultAsync();
    }
}