using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TimeWarden.Domain.Entities.Clients;
using TimeWarden.Domain.Entities.Identity;
using TimeWarden.Domain.Entities.Invoices;

namespace TimeWarden.Infrastructure;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<ItemOfWork> ItemsOfWork => Set<ItemOfWork>();
}