using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Salonify.Api.Services;

namespace Salonify.Api.Tests;

public class JwtServiceTests
{
    private const string TestKey = "unit_test_jwt_key_that_is_long_enough_123456";

    private static JwtService CreateService()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = TestKey
            })
            .Build();

        return new JwtService(configuration);
    }

    private static User CreateUser() => new()
    {
        Id = "665f1c2ab3d4e5f6a7b8c9d0",
        Email = "test@salonify.local",
        DisplayName = "Test User",
        PasswordHash = "hash",
        Role = UserRole.Salon
    };

    [Fact]
    public void GenerateToken_ProducesValidJwt()
    {
        var token = CreateService().GenerateToken(CreateUser());

        Assert.True(new JwtSecurityTokenHandler().CanReadToken(token));
    }

    [Fact]
    public void GenerateToken_ContainsUserClaims()
    {
        var user = CreateUser();
        var token = CreateService().GenerateToken(user);

        var principal = ValidateToken(token);

        Assert.Equal(user.Id, principal.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        Assert.Equal("Salon", principal.FindFirst(ClaimTypes.Role)?.Value);
        Assert.Equal(user.DisplayName, principal.FindFirst(ClaimTypes.Name)?.Value);
    }

    [Fact]
    public void GenerateToken_IsSignedWithHmacSha256()
    {
        var token = CreateService().GenerateToken(CreateUser());

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Equal(SecurityAlgorithms.HmacSha256, jwt.Header.Alg);
    }

    [Fact]
    public void GenerateToken_ExpiresInThreeHours()
    {
        var token = CreateService().GenerateToken(CreateUser());

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        var expectedExpiry = DateTime.UtcNow.AddHours(3);

        Assert.InRange(jwt.ValidTo, expectedExpiry.AddMinutes(-2), expectedExpiry.AddMinutes(2));
    }

    [Fact]
    public void GenerateToken_SignatureFailsWithWrongKey()
    {
        var token = CreateService().GenerateToken(CreateUser());

        Assert.ThrowsAny<SecurityTokenException>(() =>
            ValidateToken(token, "some_completely_different_key_9876543210"));
    }

    private static ClaimsPrincipal ValidateToken(string token, string key = TestKey)
    {
        return new JwtSecurityTokenHandler().ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
        }, out _);
    }
}
