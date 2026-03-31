using TimeWarden.Domain.Entities.Invoices;

namespace TimeWarden.Domain.Entities.Clients;

public class Client
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string Zip { get; set; } = string.Empty;
    public string Attention { get; set; } = string.Empty;
    public DateTime Created { get; set; } = DateTime.UtcNow;
    public DateTime? Modified { get; set; } = null;
    public bool Trash { get; set; } = false;

    public List<Project> Projects { get; set; } = new();
}