namespace TimeWarden.Application.Models.Client;

public class ProjectCreateModel
{
    public string? Id { get; set; }
    public string ClientId { get; set; } = null!;
    public string ProjectName { get; set; } = string.Empty;
}