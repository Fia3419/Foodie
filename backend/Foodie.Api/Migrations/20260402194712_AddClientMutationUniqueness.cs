using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Foodie.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddClientMutationUniqueness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_WeightLogEntries_UserId_ClientMutationId",
                table: "WeightLogEntries",
                columns: new[] { "UserId", "ClientMutationId" },
                unique: true,
                filter: "[ClientMutationId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_MealLogEntries_UserId_ClientMutationId",
                table: "MealLogEntries",
                columns: new[] { "UserId", "ClientMutationId" },
                unique: true,
                filter: "[ClientMutationId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WeightLogEntries_UserId_ClientMutationId",
                table: "WeightLogEntries");

            migrationBuilder.DropIndex(
                name: "IX_MealLogEntries_UserId_ClientMutationId",
                table: "MealLogEntries");
        }
    }
}
