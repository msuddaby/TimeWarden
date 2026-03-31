using TimeWarden.Domain.Entities.Clients;

namespace TimeWarden.Domain.Entities.Invoices;

public class Invoice
{
    public string Id { get; set; } = null!;
    public string ClientId { get; set; } = null!;
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    public virtual Client Client { get; set; } = null!;
    public virtual List<ItemOfWork> ItemsOfWork { get; set; } = null!;
}