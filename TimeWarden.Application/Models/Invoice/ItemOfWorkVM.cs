using TimeWarden.Application.Models.Client;

namespace TimeWarden.Application.Models.Invoice;

public class ItemOfWorkVM
{
    public string Id { get; set; } = null!;
    public string? InvoiceId { get; set; }
    public string? ProjectId { get; set; }
    public string Description { get; set; } = null!;
    public decimal HourlyRate { get; set; }
    public decimal HoursOfWork { get; set; }
    public DateTime DateOfWork { get; set; }
    public ProjectVM? Project { get; set; }
}