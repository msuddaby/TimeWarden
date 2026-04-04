using TimeWarden.Domain.Entities.Invoices;

namespace TimeWarden.Domain.Entities.Clients;

public class Project
{
    public string Id { get; set; } = null!;
    public string ClientId { get; set; } = null!;
    public string ProjectName { get; set; } = string.Empty;

    public virtual Client Client { get; set; } = null!;
    public virtual List<ItemOfWork> ItemsOfWork { get; set; }
}