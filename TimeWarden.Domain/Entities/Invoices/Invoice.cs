using System.ComponentModel.DataAnnotations;
using TimeWarden.Domain.Entities.Clients;
using TimeWarden.Domain.Entities.Identity;

namespace TimeWarden.Domain.Entities.Invoices;

public class Invoice
{
    [StringLength(256)]
    public string Id { get; set; } = null!;
    [StringLength(256)]
    public string ClientId { get; set; } = null!;
    [StringLength(256)]
    public string UserId { get; set; } = null!;
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;

    public virtual Client Client { get; set; } = null!;
    public virtual List<ItemOfWork> ItemsOfWork { get; set; } = null!;
    public virtual ApplicationUser User { get; set; } = null!;
}