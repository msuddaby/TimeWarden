using Microsoft.Extensions.DependencyInjection;
using TimeWarden.Application.Services;

namespace TimeWarden.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddTimeWardenServices(this IServiceCollection services)
    {
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<ITokenService, TokenService>();

        return services;
    }
}