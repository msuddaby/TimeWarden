using Microsoft.EntityFrameworkCore;
using TimeWarden.Application.Models.Client;
using TimeWarden.Application.Models.Invoice;
using TimeWarden.Domain.Entities.Invoices;
using TimeWarden.Infrastructure;

namespace TimeWarden.Application.Services;

public interface IInvoiceService
{
    Task<List<InvoiceVM>> GetInvoicesByClient(string clientId);
    Task<InvoiceVM> GetInvoice(string invoiceId);
    Task CreateInvoice(InvoiceCreateModel model);
    Task UpdateInvoice(InvoiceCreateModel model);
}

public class InvoiceService : IInvoiceService
{
    private readonly ApplicationDbContext _context;

    public InvoiceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<InvoiceVM>> GetInvoicesByClient(string clientId)
    {
        var result = await _context.Invoices.Where(x => x.ClientId == clientId)
            .OrderByDescending(x => x.Created)
            .Select(x => new InvoiceVM()
            {
                ClientId = x.ClientId,
                Id = x.Id,
                InvoiceDate = x.InvoiceDate
            }).ToListAsync();

        return result;
    }

    public async Task<InvoiceVM> GetInvoice(string invoiceId)
    {
        var invoice = await _context.Invoices.Where(x => x.Id == invoiceId).FirstOrDefaultAsync();

        if (invoice is null)
        {
            throw new ApplicationException("Invoice not found");
        }

        var invoiceProjects = await _context.Projects.Where(x => x.ClientId == invoice.ClientId).ToListAsync();

        var invoiceLineItems = await _context
            .ItemsOfWork
            .Where(x => x.InvoiceId == invoiceId)
            .ToListAsync();

        var result = new InvoiceVM()
        {
            ClientId = invoice.ClientId,
            Id = invoice.Id,
            InvoiceDate = invoice.InvoiceDate,
            ItemsOfWork = invoiceLineItems.Select(x => new ItemOfWorkVM()
            {
                Id = x.Id,
                InvoiceId = x.InvoiceId,
                DateOfWork = x.DateOfWork,
                Description = x.Description,
                HourlyRate = x.HourlyRate,
                HoursOfWork = x.HoursOfWork,
                ProjectId = x.ProjectId,
                Project = invoiceProjects.Where(y => y.Id == x.ProjectId).Select(z => new ProjectVM()
                {
                    ClientId = z.ClientId,
                    Id = z.Id,
                    ProjectName = z.ProjectName
                }).FirstOrDefault(),
            }).ToList()
        };

        return result;
    }

    public async Task CreateInvoice(InvoiceCreateModel model)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        
        
        var newInvoice = new Invoice()
        {
            Id = Guid.NewGuid().ToString(),
            Created = DateTime.UtcNow,
            ClientId = model.ClientId,
            InvoiceDate = DateTime.SpecifyKind(model.InvoiceDate, DateTimeKind.Utc),
        };

        await _context.Invoices.AddAsync(newInvoice);

        await _context.SaveChangesAsync();

        List<ItemOfWork> workItems = new();
        
        foreach (var workItem in model.ItemsOfWork)
        {
            workItems.Add(new ItemOfWork()
            {
                Id = Guid.NewGuid().ToString(),
                Created = DateTime.UtcNow,
                DateOfWork = DateTime.SpecifyKind(workItem.DateOfWork, DateTimeKind.Utc),
                Description = workItem.Description,
                HourlyRate = workItem.HourlyRate,
                HoursOfWork = workItem.HoursOfWork,
                InvoiceId = newInvoice.Id,
                ProjectId = workItem.ProjectId,
            });
        }

        await _context.ItemsOfWork.AddRangeAsync(workItems);

        await _context.SaveChangesAsync();

        await transaction.CommitAsync();
    }

    public async Task UpdateInvoice(InvoiceCreateModel model)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        var invoice = await _context.Invoices
            .Where(x => x.Id == model.Id)
            .Include(x => x.ItemsOfWork)
            .FirstOrDefaultAsync();

        if (invoice is null)
        {
            throw new ApplicationException("Invoice not found");
        }

        invoice.InvoiceDate = DateTime.SpecifyKind(model.InvoiceDate, DateTimeKind.Utc);

        List<ItemOfWork> newItemsOfWork = new();

        foreach (var workItem in model.ItemsOfWork)
        {
            var existing = invoice.ItemsOfWork
                .FirstOrDefault(x => x.Id == workItem.Id);

            if (existing is not null)
            {
                existing.DateOfWork = DateTime.SpecifyKind(workItem.DateOfWork, DateTimeKind.Utc);
                existing.Description = workItem.Description;
                existing.HourlyRate = workItem.HourlyRate;
                existing.HoursOfWork = workItem.HoursOfWork;
            }
            else
            {
                newItemsOfWork.Add(new ItemOfWork()
                {
                    Id = Guid.NewGuid().ToString(),
                    InvoiceId = invoice.Id,
                    Created = DateTime.UtcNow,
                    DateOfWork = DateTime.SpecifyKind(workItem.DateOfWork, DateTimeKind.Utc),
                    Description = workItem.Description,
                    HourlyRate = workItem.HourlyRate,
                    HoursOfWork = workItem.HoursOfWork,
                    ProjectId = workItem.ProjectId,
                });
            }
        }

        
        await _context.ItemsOfWork.AddRangeAsync(newItemsOfWork);

        await _context.SaveChangesAsync();

        await transaction.CommitAsync();
    }
}