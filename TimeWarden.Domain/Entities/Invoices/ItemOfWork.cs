using System.ComponentModel.DataAnnotations;
using TimeWarden.Domain.Entities.Clients;

namespace TimeWarden.Domain.Entities.Invoices;

public class ItemOfWork
{
    [StringLength(256)]
    public string Id { get; set; } = null!;
    [StringLength(256)]
    public string InvoiceId { get; set; } = null!;
    [StringLength(256)]
    public string? ProjectId { get; set; }
    [StringLength(2048)]
    public string Description { get; set; } = null!;
    public decimal HourlyRate { get; set; }
    public decimal HoursOfWork { get; set; }
    public DateTime DateOfWork { get; set; }
    public DateTime Created { get; set; }
    public bool Trash { get; set; }

    public virtual Invoice Invoice { get; set; } = null!;
    public virtual Project? Project { get; set; }
}