namespace TimeWarden.Application.Models.Invoice;

public class InvoiceCreateModel
{
    public string? Id { get; set; }
    public string ClientId { get; set; } = null!;
    public DateTime InvoiceDate { get; set; }
    public List<ItemOfWorkCreateModel> ItemsOfWork { get; set; } = new();
}