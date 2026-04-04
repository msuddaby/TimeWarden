using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeWarden.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ProjectItemsOfWork : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProjectId",
                table: "ItemsOfWork",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ItemsOfWork_ProjectId",
                table: "ItemsOfWork",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_ItemsOfWork_Projects_ProjectId",
                table: "ItemsOfWork",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ItemsOfWork_Projects_ProjectId",
                table: "ItemsOfWork");

            migrationBuilder.DropIndex(
                name: "IX_ItemsOfWork_ProjectId",
                table: "ItemsOfWork");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "ItemsOfWork");
        }
    }
}
