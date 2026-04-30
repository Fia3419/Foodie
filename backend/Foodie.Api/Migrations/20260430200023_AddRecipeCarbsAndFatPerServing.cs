using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Foodie.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRecipeCarbsAndFatPerServing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CarbsPerServing",
                table: "Recipes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "FatPerServing",
                table: "Recipes",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CarbsPerServing",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "FatPerServing",
                table: "Recipes");
        }
    }
}
