using TimeWarden.Application.Models.Auth;
using TimeWarden.Application.Models.Client;
using TimeWarden.Domain.Entities.Invoices;

namespace TimeWarden.Application.Models.Invoice;

public class InvoiceVM
{
    public string? Id { get; set; }
    public string ClientId { get; set; } = null!;
    public DateTime InvoiceDate { get; set; }
    public InvoiceStatus Status { get; set; }
    public int ItemCount { get; set; }
    public decimal TotalAmount { get; set; }
    public List<ItemOfWorkVM> ItemsOfWork { get; set; } = new();
    public ClientVM Client { get; set; } = null!;
    public UserVM? User { get; set; }
}