namespace TimeWarden.Application.Models.Invoice;

public class InvoiceVM
{
    public string? Id { get; set; }
    public string ClientId { get; set; } = null!;
    public DateTime InvoiceDate { get; set; }
    public List<ItemOfWorkVM> ItemsOfWork { get; set; } = new();
}