using Microsoft.EntityFrameworkCore;
using TimeWarden.Application.Models.Client;
using TimeWarden.Domain.Entities.Clients;
using TimeWarden.Infrastructure;

namespace TimeWarden.Application.Services;

public interface IProjectService
{
    Task<List<ProjectVM>> GetProjectsByClient(string clientId);
    Task CreateProject(ProjectCreateModel model);
    Task UpdateProject(ProjectCreateModel model);
}

public class ProjectService : IProjectService
{
    private readonly ApplicationDbContext _context;

    public ProjectService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProjectVM>> GetProjectsByClient(string clientId)
    {
        var result = await _context
            .Projects
            .Where(x => x.ClientId == clientId)
            .Select(x => new ProjectVM()
            {
                Id = x.Id,
                ClientId = x.ClientId,
                ProjectName = x.ProjectName
            })
            .ToListAsync();

        return result;
    }

    public async Task CreateProject(ProjectCreateModel model)
    {
        var project = new Project()
        {
            Id = Guid.NewGuid().ToString(),
            ClientId = model.ClientId,
            ProjectName = model.ProjectName
        };

        await _context.Projects.AddAsync(project);

        await _context.SaveChangesAsync();
    }

    public async Task UpdateProject(ProjectCreateModel model)
    {
        if (model.Id is null) return;

        await _context.Projects
            .Where(x => x.Id == model.Id)
            .ExecuteUpdateAsync(builder =>
                builder.SetProperty(x => x.ProjectName, model.ProjectName)
            );
    }
}