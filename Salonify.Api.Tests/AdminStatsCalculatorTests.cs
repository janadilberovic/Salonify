namespace Salonify.Api.Tests;

public class AdminStatsCalculatorTests
{
    private static Salon Salon(string id, string name = "Salon", string city = "Sarajevo") => new()
    {
        Id = id,
        UserId = "owner-" + id,
        Name = name,
        City = city
    };

    private static Review Review(string salonId, int rating) => new()
    {
        Id = Guid.NewGuid().ToString(),
        UserId = "user-1",
        SalonId = salonId,
        Rating = rating,
        Comment = string.Empty
    };

    [Fact]
    public void Build_GroupsAppointmentsByStatus_AndIncludesZeroCounts()
    {
        var appointments = new List<Appointment>
        {
            new() { Id = "a1", UserId = "u1", SalonId = "s1", Status = AppointmentStatus.Pending },
            new() { Id = "a2", UserId = "u1", SalonId = "s1", Status = AppointmentStatus.Pending },
            new() { Id = "a3", UserId = "u2", SalonId = "s1", Status = AppointmentStatus.Completed }
        };

        var stats = AdminStatsCalculator.Build(
            totalUsers: 10,
            totalSalons: 3,
            appointments,
            new List<Salon>(),
            new List<Review>());

        Assert.Equal(10, stats.TotalUsers);
        Assert.Equal(3, stats.TotalSalons);
        Assert.Equal(3, stats.TotalAppointments);
        Assert.Equal(2, stats.AppointmentsByStatus["Pending"]);
        Assert.Equal(1, stats.AppointmentsByStatus["Completed"]);
        Assert.Equal(0, stats.AppointmentsByStatus["Approved"]);
        Assert.Equal(0, stats.AppointmentsByStatus["Rejected"]);
        Assert.Equal(0, stats.AppointmentsByStatus["Cancelled"]);
        Assert.Equal(Enum.GetValues<AppointmentStatus>().Length, stats.AppointmentsByStatus.Count);
    }

    [Fact]
    public void Build_TopSalons_OrdersByReviewCountThenRating_AndTakesFive()
    {
        var salons = Enumerable.Range(1, 6)
            .Select(i => Salon($"s{i}", $"Salon {i}"))
            .ToList();

        var reviews = new List<Review>();
        // s1: 3 recenzije avg 3, s2: 3 recenzije avg 5, s3: 2 recenzije, s4-s6: po 1
        reviews.AddRange(new[] { Review("s1", 3), Review("s1", 3), Review("s1", 3) });
        reviews.AddRange(new[] { Review("s2", 5), Review("s2", 5), Review("s2", 5) });
        reviews.AddRange(new[] { Review("s3", 4), Review("s3", 5) });
        reviews.Add(Review("s4", 5));
        reviews.Add(Review("s5", 2));
        reviews.Add(Review("s6", 1));

        var stats = AdminStatsCalculator.Build(0, 6, new List<Appointment>(), salons, reviews);

        Assert.Equal(5, stats.TopSalons.Count);
        Assert.Equal("s2", stats.TopSalons[0].SalonId); // isti count kao s1, veći avg
        Assert.Equal("s1", stats.TopSalons[1].SalonId);
        Assert.Equal("s3", stats.TopSalons[2].SalonId);
        Assert.Equal(4.5, stats.TopSalons[2].AverageRating);
        Assert.DoesNotContain(stats.TopSalons, s => s.SalonId == "s6" && stats.TopSalons.Count == 6);
    }

    [Fact]
    public void Build_TopSalons_SkipsReviewsForDeletedSalons()
    {
        var stats = AdminStatsCalculator.Build(
            0, 1,
            new List<Appointment>(),
            new List<Salon> { Salon("s1") },
            new List<Review> { Review("s1", 5), Review("obrisani-salon", 5) });

        Assert.Single(stats.TopSalons);
        Assert.Equal("s1", stats.TopSalons[0].SalonId);
    }
}
