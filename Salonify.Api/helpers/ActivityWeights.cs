public static class ActivityWeights
{
    public static double GetWeight(ActivityType type)
    {
        return type switch
        {
            ActivityType.Search => 1.0,
            ActivityType.ViewSalon => 2.0,
            ActivityType.ViewService => 3.0,
            ActivityType.AppointmentCreated => 5.0,
            ActivityType.AppointmentCompleted => 7.0,
            ActivityType.ReviewAdded => 4.0,
            _ => 1.0
        };
    }
}

