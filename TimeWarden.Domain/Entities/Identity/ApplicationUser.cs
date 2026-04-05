using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace TimeWarden.Domain.Entities.Identity;

public class ApplicationUser : IdentityUser
{
    [StringLength(256)]
    public string Name { get; set; } = null!;
    [StringLength(256)]
    public string Address { get; set; } = null!;
    [StringLength(256)]
    public string City { get; set; } = null!;
    [StringLength(256)]
    public string Province { get; set; } = null!;
    [StringLength(256)]
    public string Phone { get; set; } = null!;
    [StringLength(256)]
    public string Zip { get; set; } = null!;
}