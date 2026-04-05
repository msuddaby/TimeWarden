using Microsoft.EntityFrameworkCore;
using TimeWarden.Application.Models.Auth;
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
    Task UpdateInvoiceStatus(InvoiceStatusUpdateModel model);
}

public class InvoiceService : IInvoiceService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public InvoiceService(ApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<InvoiceVM>> GetInvoicesByClient(string clientId)
    {
        var result = await _context.Invoices.Where(x => x.ClientId == clientId && x.UserId == _currentUser.UserId)
            .Include(x => x.Client)
            .OrderByDescending(x => x.Created)
            .Select(x => new InvoiceVM()
            {
                ClientId = x.ClientId,
                Id = x.Id,
                InvoiceDate = x.InvoiceDate,
                Status = x.Status,
                ItemCount = x.ItemsOfWork.Count,
                TotalAmount = x.ItemsOfWork.Sum(w => w.HourlyRate * w.HoursOfWork),
                Client = new ClientVM()
                {
                    Id = x.ClientId,
                    Name = x.Client.Name,
                    Address = x.Client.Address,
                    Attention = x.Client.Attention,
                    City = x.Client.City,
                    Province = x.Client.Province,
                    Zip = x.Client.Zip,
                }
            }).ToListAsync();

        return result;
    }

    public async Task<InvoiceVM> GetInvoice(string invoiceId)
    {
        var invoice = await _context.Invoices
            .Where(x => x.Id == invoiceId)
            .Include(x => x.Client)
            .Include(x => x.User)
            .FirstOrDefaultAsync();

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
            Status = invoice.Status,
            Client = new ClientVM()
            {
                Id = invoice.Client.Id,
                Name = invoice.Client.Name,
                Address = invoice.Client.Address,
                Attention = invoice.Client.Attention,
                City = invoice.Client.City,
                Province = invoice.Client.Province,
                Zip = invoice.Client.Zip,
            },
            User = new UserVM(
                invoice.User.Id,
                invoice.User.UserName!,
                invoice.User.Name,
                invoice.User.Address,
                invoice.User.City,
                invoice.User.Province,
                invoice.User.Zip,
                invoice.User.Phone
            ),
            ItemCount = invoiceLineItems.Count,
            TotalAmount = invoiceLineItems.Sum(x => x.HourlyRate * x.HoursOfWork),
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
            UserId = _currentUser.UserId,
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

    public async Task UpdateInvoiceStatus(InvoiceStatusUpdateModel model)
    {
        var invoice = await _context.Invoices
            .Where(x => x.Id == model.InvoiceId && x.UserId == _currentUser.UserId)
            .FirstOrDefaultAsync();

        if (invoice is null)
            throw new ApplicationException("Invoice not found");

        var allowed = (invoice.Status, model.Status) switch
        {
            (InvoiceStatus.Draft, InvoiceStatus.Sent) => true,
            (InvoiceStatus.Sent, InvoiceStatus.Paid) => true,
            _ => false,
        };

        if (!allowed)
            throw new ApplicationException(
                $"Cannot transition from {invoice.Status} to {model.Status}");

        invoice.Status = model.Status;
        await _context.SaveChangesAsync();
    }
}