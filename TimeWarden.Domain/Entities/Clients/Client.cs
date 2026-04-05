using System.ComponentModel.DataAnnotations;
using TimeWarden.Domain.Entities.Identity;
using TimeWarden.Domain.Entities.Invoices;

namespace TimeWarden.Domain.Entities.Clients;

public class Client
{
    [StringLength(256)]
    public string Id { get; set; } = null!;
    [StringLength(256)]
    public string UserId { get; set; } = null!;
    [StringLength(256)]
    public string Name { get; set; } = string.Empty;
    [StringLength(256)]
    public string Address { get; set; } = string.Empty;
    [StringLength(256)]
    public string City { get; set; } = string.Empty;
    [StringLength(256)]
    public string Province { get; set; } = string.Empty;
    [StringLength(256)]
    public string Zip { get; set; } = string.Empty;
    [StringLength(256)]
    public string Attention { get; set; } = string.Empty;
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime? Modified { get; set; } = null;
    public bool Trash { get; set; } = false;

    public virtual List<Project> Projects { get; set; } = new();
    public virtual ApplicationUser User { get; set; } = null!;
}