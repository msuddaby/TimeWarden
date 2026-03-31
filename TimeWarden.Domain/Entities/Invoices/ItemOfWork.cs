namespace TimeWarden.Domain.Entities.Invoices;

public class ItemOfWork
{
    public string Id { get; set; } = null!;
    public string InvoiceId { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal HourlyRate { get; set; }
    public decimal HoursOfWork { get; set; }
    public DateTime DateOfWork { get; set; }
    public DateTime Created { get; set; }

    public virtual Invoice Invoice { get; set; } = null!;
}