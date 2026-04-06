using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeWarden.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InvoiceExtraNotes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExtraNotes",
                table: "Invoices",
                type: "character varying(8192)",
                maxLength: 8192,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExtraNotes",
                table: "Invoices");
        }
    }
}
