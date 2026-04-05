using System.ComponentModel.DataAnnotations;

namespace TimeWarden.Application.Models.Auth;

public record RegisterRequest(
    [Required, StringLength(32, MinimumLength = 1)] string Username,
    [Required, EmailAddress] string Email,
    [Required, StringLength(128, MinimumLength = 8)] string Password,
    [Required, StringLength(256)] string Name,
    [Required, StringLength(256)] string Address,
    [Required, StringLength(256)] string City,
    [Required, StringLength(256)] string Province,
    [Required, StringLength(256)] string Zip,
    [Required, StringLength(256)] string Phone
);

public record LoginRequest(
    [Required] string Username,
    [Required] string Password
);

public record LogoutRequest([Required] string RefreshToken);

public record AuthResponse(string Token, string RefreshToken, UserVM User);

public record UserVM(string Id, string Username, string Name, string Address, string City, string Province, string Zip, string Phone);

