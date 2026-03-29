public class RegisterRequest
{
    public string Email { get; set; }
    public string Password { get; set; }

    public UserRole Role { get; set; }

    // Ime i prezime korisnika ili naziv salona
    public string DisplayName { get; set; }

    // Samo za salon
    public string? SalonDescription { get; set; }
}
