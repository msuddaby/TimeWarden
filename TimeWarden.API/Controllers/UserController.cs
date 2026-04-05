using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeWarden.Application.Models.Auth;
using TimeWarden.Application.Services;
using TimeWarden.Domain.Entities.Identity;
using TimeWarden.Infrastructure;
using LoginRequest = TimeWarden.Application.Models.Auth.LoginRequest;
using RegisterRequest = TimeWarden.Application.Models.Auth.RegisterRequest;

namespace TimeWarden.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly ApplicationDbContext _context;


    public UserController(UserManager<ApplicationUser> userManager, 
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService, 
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _context = context;
    }
    
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var user = new ApplicationUser()
        {
            UserName = request.Username,
            Email = request.Email,
            Name = request.Name,
            Address = request.Address,
            City = request.City,
            Province = request.Province,
            Zip = request.Zip,
            Phone = request.Phone,
        };
    
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }
    
        var response = await CreateAuthResponseAsync(user);
    
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await _userManager.FindByNameAsync(request.Username);
        if (user == null)
        {
            return Unauthorized("Invalid credentials");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            return Unauthorized("Invalid credentials");
        }

        var response = await CreateAuthResponseAsync(user);

        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken)) return Unauthorized("Invalid refresh token");

        var tokenHash = TokenService.HashToken(request.RefreshToken);
        var storedToken = await _context.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.TokenHash == tokenHash);

        if (storedToken == null || storedToken.User == null)
        {
            return Unauthorized("Invalid refresh token");
        }

        if (!storedToken.IsActive)
        {
            if (storedToken.RevokedAt.HasValue && storedToken.ReplacedByTokenId.HasValue &&
                (DateTime.UtcNow - storedToken.RevokedAt.Value).TotalSeconds <= 30)
            {
                var currentToken = await FollowReplacementChainAsync(storedToken.ReplacedByTokenId.Value);

                if (currentToken is not null)
                {
                    currentToken.RevokedAt = DateTime.UtcNow;
                }

                var newRefresh = TokenService.CreateRefreshToken(storedToken.User, out var newRefreshToken);
                _context.RefreshTokens.Add(newRefresh);
                await _context.SaveChangesAsync();

                var accessToken = _tokenService.CreateToken(storedToken.User);
                return Ok(new AuthResponse(accessToken, newRefreshToken, ToUserDto(storedToken.User)));
            }

            return Unauthorized("Invalid refresh token");
        }

        var newRotatedRefresh = TokenService.CreateRefreshToken(storedToken.User, out var newRotatedRefreshToken);
        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.ReplacedByTokenId = newRotatedRefresh.Id;

        _context.RefreshTokens.Add(newRotatedRefresh);
        await _context.SaveChangesAsync();

        var newAccessToken = _tokenService.CreateToken(storedToken.User);
        return Ok(new AuthResponse(newAccessToken, newRotatedRefreshToken, ToUserDto(storedToken.User)));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(LogoutRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken)) return Ok();

        var tokenHash = TokenService.HashToken(request.RefreshToken);
        var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.TokenHash == tokenHash);
        if (storedToken == null) return Ok();

        storedToken.RevokedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok();
    }
    
    private static UserVM ToUserDto(ApplicationUser user) =>
        new(user.Id, user.UserName!, user.Name, user.Address, user.City, user.Province, user.Zip, user.Phone);
    
    private async Task<RefreshToken?> FollowReplacementChainAsync(Guid tokenId)
    {
        var token = await _context.RefreshTokens.FindAsync(tokenId);
        const int maxDepth = 10;
        for (var i = 0; i < maxDepth && token?.ReplacedByTokenId != null; i++)
            token = await _context.RefreshTokens.FindAsync(token.ReplacedByTokenId);
        return token;
    }
    
    private async Task<AuthResponse> CreateAuthResponseAsync(ApplicationUser user)
    {
        var refresh = TokenService.CreateRefreshToken(user, out var refreshToken);
        _context.RefreshTokens.Add(refresh);
        await _context.SaveChangesAsync();
    
        var accessToken = _tokenService.CreateToken(user);
        return new AuthResponse(accessToken, refreshToken, ToUserDto(user));
    }
    
    
}