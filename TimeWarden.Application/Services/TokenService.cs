using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TimeWarden.Domain.Entities.Identity;

namespace TimeWarden.Application.Services;

public interface ITokenService
{
    string CreateToken(ApplicationUser user);
}

public class TokenService : ITokenService
{
    private IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    private const int DefaultAccessTokenMinutes = 120;
    private const int DefaultRefreshTokenDays = 30;


    public string CreateToken(ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName!),
        };

        var jwtKey = _configuration["JWT:Key"] ?? throw new InvalidOperationException("JWT_KEY is not configured. Check your .env file.");
        var jwtIssuer = _configuration["JWT:Issuer"];
        var jwtAudience = _configuration["JWT:Audience"];
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(GetAccessTokenLifetimeMinutes()),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    private int GetAccessTokenLifetimeMinutes()
    {
        var value = _configuration["JWT:TokenLifetime"];
        return int.TryParse(value, out var minutes) && minutes > 0 ? minutes : DefaultAccessTokenMinutes;
    }
    
    public static RefreshToken CreateRefreshToken(ApplicationUser user, out string rawToken)
    {
        rawToken = GenerateRefreshToken();
        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = HashToken(rawToken),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(GetRefreshTokenLifetimeDays())
        };
    }
    
    public static string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes)
            .Replace('+', '-')
            .Replace('/', '_')
            .TrimEnd('=');
    }
    
    public static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    private static int GetRefreshTokenLifetimeDays()
    {
        var value = Environment.GetEnvironmentVariable("REFRESH_TOKEN_DAYS");
        return int.TryParse(value, out var days) && days > 0 ? days : DefaultRefreshTokenDays;
    }
}