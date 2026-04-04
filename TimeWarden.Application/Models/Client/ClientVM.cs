namespace TimeWarden.Application.Models.Client;

public class ClientVM
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string Zip { get; set; } = string.Empty;
    public string Attention { get; set; } = string.Empty;
}