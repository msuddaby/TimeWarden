using Microsoft.EntityFrameworkCore;
using TimeWarden.Application.Models.Client;
using TimeWarden.Domain.Entities.Clients;
using TimeWarden.Infrastructure;

namespace TimeWarden.Application.Services;

public interface IClientService
{
    Task<List<ClientVM>> GetList();
    Task CreateClient(ClientCreateModel model);
    Task EditClient(ClientCreateModel model);
    Task DeleteClient(string id, bool trash);
}

public class ClientService : IClientService
{
    private readonly ApplicationDbContext _context;

    public ClientService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ClientVM>> GetList()
    {
        var res = await _context.Clients
            .OrderByDescending(x => x.Created)
            .Select(x => new ClientVM()
            {
                Address = x.Address,
                Attention = x.Attention,
                City = x.City,
                Province = x.Province,
                Zip = x.Zip,
                Name = x.Name,
                Id = x.Id
            })
            .ToListAsync();

        return res;
    }

    public async Task CreateClient(ClientCreateModel model)
    {
        var ent = new Client()
        {
            Id = Guid.NewGuid().ToString(),
            Address = model.Address,
            Attention = model.Attention,
            City = model.City,
            Created = DateTime.UtcNow,
            Name = model.Name,
            Province = model.Province,
            Trash = false,
            Zip = model.Zip
        };

        await _context.Clients.AddAsync(ent);

        await _context.SaveChangesAsync();
    }

    public async Task EditClient(ClientCreateModel model)
    {
        if (model.Id is null) return;

        await _context.Clients
            .Where(x => x.Id == model.Id)
            .ExecuteUpdateAsync(builder =>
                builder.SetProperty(x => x.Address, model.Address)
                    .SetProperty(x => x.Attention, model.Attention)
                    .SetProperty(x => x.City, model.City)
                    .SetProperty(x => x.Modified, DateTime.UtcNow)
                    .SetProperty(x => x.Name, model.Name)
                    .SetProperty(x => x.Province, model.Province)
                    .SetProperty(x => x.Zip, model.Zip)
            );
    }

    public async Task DeleteClient(string id, bool trash)
    {
        await _context.Clients
            .Where(x => x.Id == id)
            .ExecuteUpdateAsync(builder => builder.SetProperty(x => x.Trash, trash));
    }
    
}