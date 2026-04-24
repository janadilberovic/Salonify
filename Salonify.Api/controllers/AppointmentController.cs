using DnsClient.Protocol;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Salonify.Api.Repositories;
using System.Security.Claims;

namespace Salonify.Api.Controllers;

[ApiController]
[Route("api/appointments")]
public class AppointmentController : ControllerBase
{
    private readonly AppointmentRepository _appointmentRepository;
    private readonly SalonRepository _salonRepository;
    private readonly UserRepository _userRepository;
    public AppointmentController(AppointmentRepository ar, SalonRepository sr, UserRepository ur)
    {
        _appointmentRepository = ar;
        _salonRepository = sr;
        _userRepository = ur;
    }

    [HttpGet("get/{id}")]
    public async Task<IActionResult> GetAppointmentById(string id)
    {
        var appointment = await _appointmentRepository.GetByIdAsync(id);
        if (appointment == null)
        {
            return NotFound(new { message = "Termin sa tim ID-jem nije pronadjen. " });

        }
        return Ok(appointment);

    }
[Authorize(Roles = "Salon,User,Admin")]
[HttpPut("create-appointment")]
public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDTO appointmentDTO)
{
    if (appointmentDTO == null)
        return BadRequest(new { message = "Podaci nisu validni." });

    if (appointmentDTO.AppointmentDate.Date < DateTime.UtcNow.Date)
        return BadRequest(new { message = "Ne možete zakazati termin u prošlosti." });

    if (!TimeSpan.TryParse(appointmentDTO.StartTime, out var startTime))
        return BadRequest(new { message = "Neispravan format vremena. Koristi npr. 09:00:00." });

    if (appointmentDTO.DurationMinutes <= 0)
        return BadRequest(new { message = "Trajanje termina mora biti veće od 0." });

    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrWhiteSpace(userId))
        return Unauthorized(new { message = "Nedostaje UserId u tokenu." });

    var salon = await _salonRepository.GetBySalonIdAsync(appointmentDTO.SalonId);

    if (salon == null)
        return NotFound(new { message = "Salon nije pronađen." });

    if (salon.Services == null || !salon.Services.Any())
        return BadRequest(new { message = "Salon nema dodate usluge." });

    var service = salon.Services
        .FirstOrDefault(x => x.ServiceType == appointmentDTO.ServiceType);

    if (service == null)
        return BadRequest(new { message = "Usluga ne postoji u ovom salonu." });

    TimeSpan duration = TimeSpan.FromMinutes((double)appointmentDTO.DurationMinutes);
    TimeSpan endTime = startTime.Add(duration);

    var hasConflict = await _appointmentRepository.HasConflictAsync(
        appointmentDTO.SalonId,
        appointmentDTO.AppointmentDate.Date,
        startTime,
        endTime
    );

    if (hasConflict)
        return BadRequest(new { message = "Termin je zauzet." });

    var appointment = new Appointment
    {
        UserId = userId,
        SalonId = appointmentDTO.SalonId,
        ServiceType = appointmentDTO.ServiceType,
        Price = service.Price,
        AppointmentDate = appointmentDTO.AppointmentDate.Date,
        StartTime = startTime,
        EndTime = endTime,
        Note = appointmentDTO.Note,
        Status = AppointmentStatus.Pending,
        CreatedAt = DateTime.UtcNow
    };

    await _appointmentRepository.CreateAsync(appointment);

    return Ok(new
    {
        message = "Termin uspešno kreiran.",
        data = appointment
    });
}

    [Authorize(Roles = "User,Admin")]
    [HttpGet("appointments-user")]
    public async Task<IActionResult> GetMyAppointments()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });

        var appointments = await _appointmentRepository.GetByUserIdAsync(userId);

        if (appointments == null)
        {

            return NotFound(new { message = "Nema pronadjenih termina za ovog korisnika" });

        }
        return Ok(appointments);

    }
    [Authorize(Roles = "Salon,Admin")]
    [HttpGet("get-appointments-for-salon")]
    public async Task<IActionResult> GetAppointmentsForSalon()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound();

        var appointments =
            await _appointmentRepository.GetBySalonIdAsync(salon.Id);
        await AutoCompletePastAppointments(appointments);
        var result = new List<AppointmentResponseDTO>();

        foreach (var item in appointments)
        {
            var user = await _userRepository.GetByIdAsync(item.UserId);

            result.Add(new AppointmentResponseDTO
            {
                Id = item.Id,
                UserId = item.UserId,
                CustomerName = user?.DisplayName ?? "Nepoznat korisnik",
                CustomerEmail = user?.Email ?? "",
                CustomerPhone = user?.Phone ?? "",
                SalonId = item.SalonId,
                ServiceType = item.ServiceType,
                Price = item.Price,
                AppointmentDate = item.AppointmentDate,
                StartTime = item.StartTime,
                EndTime = item.EndTime,
                Note = item.Note,
                Status = item.Status
            });
        }

        return Ok(result);

    }
    // MANIPULISANJE TERMINIMA SA PROFILA SALONA

    [Authorize(Roles = "Salon,Admin")]
    [HttpPut("accept-appointment/{appointmentId}")]
    public async Task<IActionResult> AcceptAppointment(string appointmentId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { message = "Salon nije pronađen." });

        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);

        if (appointment == null)
            return NotFound(new { message = "Termin nije pronađen." });

        if (appointment.SalonId != salon.Id)
            return Forbid();

        if (appointment.Status == AppointmentStatus.Cancelled ||
            appointment.Status == AppointmentStatus.Rejected)
        {
            return BadRequest(new
            {
                message = "Otkazanom/Odbijenom terminu nije moguće menjati status."
            });
        }

        await _appointmentRepository.UpdateStatusAsync(
            appointmentId,
            AppointmentStatus.Approved
        );

        var updated = await _appointmentRepository.GetByIdAsync(appointmentId);

        return Ok(new
        {
            message = "Termin je prihvaćen.",
            data = updated
        });
    }



    [Authorize(Roles = "Salon,Admin")]
    [HttpPut("completed-appointment/{appointmentId}")]
    public async Task<IActionResult> CompletedAppointment(string appointmentId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { message = "Salon nije pronađen." });

        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);

        if (appointment == null)
            return NotFound(new { message = "Termin nije pronađen." });

        if (appointment.SalonId != salon.Id)
            return Forbid();

        if (appointment.Status != AppointmentStatus.Approved)
        {
            return BadRequest(new
            {
                message = "Samo odobren termin može biti završen."
            });
        }

        await _appointmentRepository.UpdateStatusAsync(
            appointmentId,
            AppointmentStatus.Completed
        );

        var updated = await _appointmentRepository.GetByIdAsync(appointmentId);

        return Ok(new
        {
            message = "Termin je završen.",
            data = updated
        });
    }



    [Authorize(Roles = "Salon,Admin")]
    [HttpPut("reject-appointment/{appointmentId}")]
    public async Task<IActionResult> RejectAppointment(string appointmentId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });

        var salon = await _salonRepository.GetByUserIdAsync(userId);

        if (salon == null)
            return NotFound(new { message = "Salon nije pronađen." });

        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);

        if (appointment == null)
            return NotFound(new { message = "Termin nije pronađen." });

        if (appointment.SalonId != salon.Id)
            return Forbid();

        if (appointment.Status == AppointmentStatus.Rejected)
            return BadRequest(new { message = "Termin je već odbijen." });

        if (appointment.Status == AppointmentStatus.Completed)
            return BadRequest(new { message = "Završen termin nije moguće odbiti." });

        await _appointmentRepository.UpdateStatusAsync(
            appointmentId,
            AppointmentStatus.Rejected
        );

        var updated = await _appointmentRepository.GetByIdAsync(appointmentId);

        return Ok(new
        {
            message = "Termin je odbijen.",
            data = updated
        });
    }
    //cancelled ide od korisnika
    [Authorize(Roles = "User,Admin")]
    [HttpPut("cancelled-appointment/{appointmentId}")]
    public async Task<IActionResult> CancelAppointment(string appointmentId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });


        AppointmentStatus status = AppointmentStatus.Cancelled;

        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
        if (appointment.UserId != userId)
        {
            return BadRequest(new { message = "Ne mozete otkazati tudji termin." });

        }
        if (appointment.Status == AppointmentStatus.Cancelled)
            return BadRequest(new { message = "Termin je već otkazan." });

        if (appointment == null)
        {
            return NotFound(new { message = "Termin nije pronadjen." });

        }
        await _appointmentRepository.UpdateStatusAsync(appointmentId, status);



        return Ok(new { message = "Termin je otkazan i obrisan" });
    }

    //prikaz za odredjeni salon za termine koje ima taj dan
    [Authorize(Roles = "Salon,Admin")]
    [HttpGet("salon/date")]
    public async Task<IActionResult> GetSalonAppointmentsByDate([FromQuery] DateTime date)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });


        var appointments = await _appointmentRepository.GetSalonAppointmentsByDateAsync(userId, date);
        return Ok(appointments);
    }
    //vrati sve slobodne termine za neki salon za odredjeni datum
    [HttpGet("salon/{salonid}/get-available-appointments-by-date")]
    public async Task<IActionResult> GetAvailableAppointmentsByDate(string salonid, [FromQuery] DateTime date,
    [FromQuery] string serviceT)
    {
        var salon = await _salonRepository.GetByIdAsync(salonid);
        if (salon == null)
        {
            return NotFound(new { message = "Ne postoji salon sa ovim idjem." });
        }

        if (!Enum.TryParse<ServiceType>(serviceT, true, out var parsedserviceType))
        {
            return BadRequest(new { message = "Neispravan tip usluge." });
        }
        var service = salon.Services.FirstOrDefault(s => s.ServiceType == parsedserviceType);
        var day = date.DayOfWeek;
        WorkingDays workingDay = salon.WorkingDays.FirstOrDefault(wd => wd.Day == day);

        if (workingDay == null)
        {
            return NotFound(new { message = "Nema informacija za ovaj radni dan." });
        }

        if (workingDay.IsClosed)
        {
            return NotFound(new { message = "Salon ne radi tog dana" });
        }



        if (!workingDay.StartTime.HasValue || !workingDay.EndTime.HasValue)
        {
            return BadRequest(new { message = "Radno vreme za ovaj dan nije dobro definisano." });
        }
        TimeSpan startTime = workingDay.StartTime.Value;
        TimeSpan endTime = workingDay.EndTime.Value;
        TimeSpan duration = TimeSpan.FromMinutes(service.DurationMinutes);


        //resenje da nadjem vremenski slot za termine, neka bude na pola h?
        var slotStep = TimeSpan.FromMinutes(30);
        var availableSlots = new List<AvailableSlotDto>();

        TimeSpan currSlot = startTime;

        while (currSlot.Add(duration) <= endTime)
        {

            TimeSpan slotEnd = currSlot.Add(duration);

            bool hasConflict = await _appointmentRepository.HasConflictAsync(salonid, date, currSlot, slotEnd);

            if (!hasConflict)
            {
                //dodajem u available
                var av = new AvailableSlotDto
                {
                    StartTime = currSlot.ToString(),
                    EndTime = slotEnd.ToString()
                };
                availableSlots.Add(av);
            }
            currSlot = currSlot.Add(slotStep);
        }
        return Ok(new
        {
            message = "Slobodni termini uspešno pronađeni.",
            data = availableSlots
        });






    }
    [Authorize(Roles = "Salon,Admin")]
    [HttpGet("get-appointments-by-status")]
    public async Task<IActionResult> GetAppointmentsByStatus([FromQuery] int statusId)
    {
        if (!Enum.IsDefined(typeof(AppointmentStatus), statusId))
        {
            return BadRequest(new { message = "Neispravan status." });
        }
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });

        var status = (AppointmentStatus)statusId;
        var appointments = await _appointmentRepository.GetAppointmentByStatus(userId, status);

        return Ok(appointments);

    }
    [Authorize(Roles = "Salon,Admin")]
    [HttpGet("get-ucpoming-appointmetns-salon")]
    public async Task<IActionResult> GetUpcomingAppointmentsForSalon()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });
        var salon = await _salonRepository.GetByIdAsync(userId);
        if (salon == null)
        {
            return BadRequest("ne postoji dati salon");
        }
        var salonID = salon.Id;


        var appointemts = await _appointmentRepository.GetUpcomingAppointmentsForSalon(salonID);
        return Ok(appointemts);
    }

    [Authorize(Roles = "User,Admin")]
    [HttpGet("get-ucpoming-appointmetns-user")]
    public async Task<IActionResult> GetUpcomingAppointmentsForUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });
        var appointemts = await _appointmentRepository.GetUpcomingAppointmentsForUser(userId);
        return Ok(appointemts);
    }

    [Authorize(Roles = "Salon,Admin")]
    [HttpGet("get-history-appointmetns-salon")]
    public async Task<IActionResult> GetHistoryAppointmentsForSalon()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });
        var salon = await _salonRepository.GetByIdAsync(userId);
        if (salon == null)
        {
            return BadRequest("ne postoji dati salon");
        }
        var salonID = salon.Id;
        var appointemts = await _appointmentRepository.GetHistoryForSalon(salonID);
        return Ok(appointemts);
    }

    [Authorize(Roles = "User,Admin")]
    [HttpGet("get-history-appointmetns-user")]
    public async Task<IActionResult> GetHistoryAppointmentsForUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });
        var appointemts = await _appointmentRepository.GetHistoryForUser(userId);
        return Ok(appointemts);
    }
    private async Task AutoCompletePastAppointments(List<Appointment> appointments)
    {
        var now = DateTime.Now;

        foreach (var appointment in appointments)
        {
            var appointmentEnd = appointment.AppointmentDate.Date + appointment.EndTime;

            if (appointment.Status == AppointmentStatus.Approved &&
                appointmentEnd < now)
            {
                await _appointmentRepository.UpdateStatusAsync(
                    appointment.Id,
                    AppointmentStatus.Completed
                );

                appointment.Status = AppointmentStatus.Completed;
            }
        }
    }
}