FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore
COPY TimeWarden.Domain/TimeWarden.Domain.csproj TimeWarden.Domain/
COPY TimeWarden.Infrastructure/TimeWarden.Infrastructure.csproj TimeWarden.Infrastructure/
COPY TimeWarden.Application/TimeWarden.Application.csproj TimeWarden.Application/
COPY TimeWarden.API/TimeWarden.API.csproj TimeWarden.API/
RUN dotnet restore TimeWarden.API/TimeWarden.API.csproj

# Install EF Core CLI tools
RUN dotnet tool install --global dotnet-ef
ENV PATH="$PATH:/root/.dotnet/tools"

# Copy everything and publish
COPY . .
RUN dotnet publish TimeWarden.API/TimeWarden.API.csproj -c Release -o /app/publish

# Generate idempotent migration SQL script
RUN dotnet ef migrations script --idempotent \
    --project TimeWarden.Infrastructure/TimeWarden.Infrastructure.csproj \
    --startup-project TimeWarden.API/TimeWarden.API.csproj \
    --output /app/publish/migrations.sql

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5062
ENTRYPOINT ["dotnet", "TimeWarden.API.dll"]
