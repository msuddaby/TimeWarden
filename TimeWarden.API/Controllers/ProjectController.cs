using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using TimeWarden.Application.Models.Client;
using TimeWarden.Application.Services;

namespace TimeWarden.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectController : ControllerBase
{
    private IProjectService _projectService;

    public ProjectController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet("ListByClient/{clientId}")]
    public async Task<ActionResult<List<ProjectVM>>> ProjectsListGetByClient(string clientId)
    {
        var result = await _projectService.GetProjectsByClient(clientId);

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> ProjectCreate(ProjectCreateModel model)
    {
        await _projectService.CreateProject(model);

        return Ok();
    }

    [HttpPatch]
    public async Task<ActionResult> ProjectUpdate(ProjectCreateModel model)
    {
        await _projectService.UpdateProject(model);

        return Ok();
    }
}