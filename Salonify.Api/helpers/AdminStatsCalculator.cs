public static class AdminStatsCalculator
{
    public static AdminStatsDto Build(
        long totalUsers,
        long totalSalons,
        List<Appointment> appointments,
        List<Salon> salons,
        List<Review> reviews)
    {
        var appointmentsByStatus = Enum.GetValues<AppointmentStatus>()
            .ToDictionary(
                status => status.ToString(),
                status => appointments.Count(a => a.Status == status)
            );

        var salonsById = salons.ToDictionary(s => s.Id);

        var topSalons = reviews
            .GroupBy(r => r.SalonId)
            .Where(group => salonsById.ContainsKey(group.Key))
            .Select(group =>
            {
                var salon = salonsById[group.Key];

                return new TopSalonDto
                {
                    SalonId = salon.Id,
                    Name = salon.Name,
                    City = salon.City,
                    AverageRating = Math.Round(group.Average(r => r.Rating), 2),
                    ReviewCount = group.Count()
                };
            })
            .OrderByDescending(s => s.ReviewCount)
            .ThenByDescending(s => s.AverageRating)
            .Take(5)
            .ToList();

        return new AdminStatsDto
        {
            TotalUsers = totalUsers,
            TotalSalons = totalSalons,
            TotalAppointments = appointments.Count,
            TotalReviews = reviews.Count,
            AppointmentsByStatus = appointmentsByStatus,
            TopSalons = topSalons
        };
    }
}
