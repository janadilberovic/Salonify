namespace Salonify.Api.Tests;

public class SlugHelperTests
{
    [Theory]
    [InlineData("Frizerski Salon Ana", "frizerski-salon-ana")]
    [InlineData("Šišanje i feniranje", "sisanje-i-feniranje")]
    [InlineData("Čokolada ćevap žuti šešir", "cokolada-cevap-zuti-sesir")]
    [InlineData("Đorđe", "djordje")]
    [InlineData("Salon @#$% 5!", "salon-5")]
    [InlineData("  višestruki   razmaci  ", "visestruki-razmaci")]
    [InlineData("vec-ima-crtice", "vec-ima-crtice")]
    public void GenerateSlug_ReturnsExpectedSlug(string input, string expected)
    {
        var slug = SlugHelper.GenerateSlug(input);

        Assert.Equal(expected, slug);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void GenerateSlug_EmptyInput_ReturnsGuidFallback(string? input)
    {
        var slug = SlugHelper.GenerateSlug(input!);

        Assert.Equal(32, slug.Length);
        Assert.Matches("^[0-9a-f]{32}$", slug);
    }

    [Fact]
    public void GenerateSlug_SameInput_IsDeterministic()
    {
        var first = SlugHelper.GenerateSlug("Beauty Studio Zen");
        var second = SlugHelper.GenerateSlug("Beauty Studio Zen");

        Assert.Equal(first, second);
    }
}
