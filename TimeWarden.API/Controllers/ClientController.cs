using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimeWarden.Application.Models.Client;
using TimeWarden.Application.Services;

namespace TimeWarden.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientController : ControllerBase
{
    private IClientService _clientService;

    public ClientController(IClientService clientService)
    {
        _clientService = clientService;
    }

    [HttpGet("List")]
    public async Task<ActionResult<List<ClientVM>>> ClientsListGet()
    {
        var result = await _clientService.GetList();

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> ClientCreate([FromBody] ClientCreateModel model)
    {
        await _clientService.CreateClient(model);

        return Ok();
    }

    [HttpPatch]
    public async Task<ActionResult> ClientEdit([FromBody] ClientCreateModel model)
    {
        await _clientService.EditClient(model);

        return Ok();
    }
}