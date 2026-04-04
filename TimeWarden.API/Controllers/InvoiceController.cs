using Microsoft.AspNetCore.Mvc;
using TimeWarden.Application.Models.Invoice;
using TimeWarden.Application.Services;

namespace TimeWarden.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InvoiceController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;

    public InvoiceController(IInvoiceService invoiceService)
    {
        _invoiceService = invoiceService;
    }

    [HttpGet("ListByClient/{clientId}")]
    public async Task<ActionResult<List<InvoiceVM>>> InvoicesGetByClient(string clientId)
    {
        var result = await _invoiceService.GetInvoicesByClient(clientId);

        return Ok(result);
    }

    [HttpGet("{invoiceId}")]
    public async Task<ActionResult<InvoiceVM>> InvoiceGetById(string invoiceId)
    {
        var result = await _invoiceService.GetInvoice(invoiceId);

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult> InvoiceCreate(InvoiceCreateModel model)
    {
        await _invoiceService.CreateInvoice(model);

        return Ok();
    }

    [HttpPatch]
    public async Task<ActionResult> InvoiceUpdate(InvoiceCreateModel model)
    {
        await _invoiceService.UpdateInvoice(model);

        return Ok();
    }
}