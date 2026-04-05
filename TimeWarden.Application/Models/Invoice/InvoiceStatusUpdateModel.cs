using TimeWarden.Domain.Entities.Invoices;

namespace TimeWarden.Application.Models.Invoice;

public class InvoiceStatusUpdateModel
{
    public string? InvoiceId { get; set; }
    public InvoiceStatus Status { get; set; }
}
