FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files and restore
COPY TimeWarden.Domain/TimeWarden.Domain.csproj TimeWarden.Domain/
COPY TimeWarden.Infrastructure/TimeWarden.Infrastructure.csproj TimeWarden.Infrastructure/
COPY TimeWarden.Application/TimeWarden.Application.csproj TimeWarden.Application/
COPY TimeWarden.API/TimeWarden.API.csproj TimeWarden.API/
RUN dotnet restore TimeWarden.API/TimeWarden.API.csproj

# Copy everything and publish
COPY . .
RUN dotnet publish TimeWarden.API/TimeWarden.API.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

EXPOSE 5062
ENTRYPOINT ["dotnet", "TimeWarden.API.dll"]
