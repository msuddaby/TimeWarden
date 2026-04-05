using System.Text.Json.Serialization;

namespace TimeWarden.Domain.Entities.Invoices;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum InvoiceStatus
{
    Draft,
    Sent,
    Paid
}
