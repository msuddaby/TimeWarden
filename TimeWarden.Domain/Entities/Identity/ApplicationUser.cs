using Microsoft.AspNetCore.Identity;

namespace TimeWarden.Domain.Entities.Identity;

public class ApplicationUser : IdentityUser
{
    public string Name { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string City { get; set; } = null!;
    public string Province { get; set; } = null!;
    public string Phone { get; set; } = null!;
}