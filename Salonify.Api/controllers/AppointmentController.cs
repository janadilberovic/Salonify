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
    public AppointmentController(AppointmentRepository ar, SalonRepository sr)
    {
        _appointmentRepository = ar;
        _salonRepository = sr;
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
        {
            return BadRequest(new { message = "Podaci nisu validni." });
        }
        //validacije
        if (appointmentDTO.AppointmentDate < DateTime.UtcNow.Date)
        {
            return BadRequest(new { message = "Ne mozete zakazati termin u proslosti." });

        }
        //da pretvorim ovo 
        if (!TimeSpan.TryParse(appointmentDTO.StartTime, out var startTime))
        {
            return BadRequest(new { message = "Neispravan format vremena." });
        }
        //konflikt 
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        TimeSpan duration = TimeSpan.FromMinutes((double)appointmentDTO.DurationMinutes);
        TimeSpan endTime = startTime.Add(duration);
        var hasConflict = await _appointmentRepository.HasConflictAsync(appointmentDTO.SalonId, appointmentDTO.AppointmentDate, startTime, endTime);
        if (hasConflict)
        {
            return BadRequest(new { message = "Termin je zauzet." });
        }
        //mapiram
        var appointment = new Appointment
        {

            UserId = userId,
            SalonId = appointmentDTO.SalonId,
            ServiceType = appointmentDTO.ServiceType,
            AppointmentDate = appointmentDTO.AppointmentDate,
            StartTime = startTime,
            EndTime = endTime,
            Note = appointmentDTO.Note,
            Status = AppointmentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };
        await _appointmentRepository.CreateAsync(appointment);

        return Ok(new
        {
            message = "Termin uspesno kreiran",
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
        var salonId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(salonId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });

        var appointments = await _appointmentRepository.GetBySalonIdAsync(salonId);

        if (appointments == null)
        {

            return NotFound(new { message = "Nema pronadjenih termina za salon" });

        }
        return Ok(appointments);

    }
    //manipulisanje rezervacijama sa profilom salona
    [Authorize(Roles = "Salon,Admin")]
    [HttpPut("accept-appointment/{appointmentId}")]
    public async Task<IActionResult> AcceptAppointment(string appointmentId)
    {
        var salonId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(salonId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });


        AppointmentStatus status = AppointmentStatus.Approved;

        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);
        if (appointment.Status == AppointmentStatus.Cancelled || appointment.Status == AppointmentStatus.Rejected)
            return BadRequest(new { message = "Otkazanom/Odbijenom terminu nije moguće menjati status." });


        if (appointment == null)
        {
            return NotFound(new { message = "Termin nije pronadjen." });

        }
        await _appointmentRepository.UpdateStatusAsync(appointmentId, status);

        var appointmentnew = await _appointmentRepository.GetByIdAsync(appointmentId);
        return Ok(new { message = "Termin je prihvacen", data = appointmentnew });
    }
    [Authorize(Roles = "Salon,Admin")]
    [HttpPut("reject-appointment/{appointmentId}")]
    public async Task<IActionResult> RejectAppointment(string appointmentId)
    {
        var salonId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(salonId))
            return Unauthorized(new { error = "Nedostaje UserId u tokenu!" });

        AppointmentStatus status = AppointmentStatus.Rejected;

        var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);

        if (appointment == null)
        {
            return NotFound(new { message = "Termin nije pronadjen." });

        }
        if (appointment.Status == AppointmentStatus.Rejected)
            return BadRequest(new { message = "Termin je već odbijen." });
        await _appointmentRepository.UpdateStatusAsync(appointmentId, status);

        var appointmentnew = await _appointmentRepository.GetByIdAsync(appointmentId);
        return Ok(new { message = "Termin je odbijen", data = appointmentnew });
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
    public async Task<IActionResult> GetAvailableAppointmentsByDate(string salonid, DateTime date, SalonService service)
    {
        var salon = await _salonRepository.GetByIdAsync(salonid);
        if (salon == null)
        {
            return NotFound(new { message = "Ne postoji salon sa ovim idjem." });
        }

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

        List<Appointment> zauzetiTermini = await _appointmentRepository.GetSalonAppointmentsByDateAsync(salonid, date);
        if (zauzetiTermini == null)
        {
            return BadRequest(new { message = "nisu pronadjeni termini nikakvi" });
        }
        TimeSpan startTime = workingDay.StartTime.Value;
        TimeSpan endTime = workingDay.EndTime.Value;
        TimeSpan duration = TimeSpan.FromMinutes(service.DurationMinutes);

        if (!workingDay.StartTime.HasValue || !workingDay.EndTime.HasValue)
        {
            return BadRequest(new { message = "Radno vreme za ovaj dan nije dobro definisano." });
        }

        //resenje da nadjem vremenski slot za termine, neka bude na pola h?
        var slotStep = TimeSpan.FromMinutes(30);
        var availableSlots = new List<AvailableSlotDto>();

        TimeSpan currSlot = startTime;

        while (currSlot.Add(slotStep) <= endTime)
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
        }
        return Ok(new
        {
            message = "Slobodni termini uspešno pronađeni.",
            data = availableSlots
        });






    }




}