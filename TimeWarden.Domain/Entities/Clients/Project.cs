using System.ComponentModel.DataAnnotations;
using TimeWarden.Domain.Entities.Identity;
using TimeWarden.Domain.Entities.Invoices;

namespace TimeWarden.Domain.Entities.Clients;

public class Project
{
    [StringLength(256)]
    public string Id { get; set; } = null!;
    [StringLength(256)]
    public string ClientId { get; set; } = null!;
    [StringLength(256)]
    public string ProjectName { get; set; } = string.Empty;
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public bool Trash { get; set; }
    
    public virtual Client Client { get; set; } = null!;
    public virtual List<ItemOfWork> ItemsOfWork { get; set; }
}