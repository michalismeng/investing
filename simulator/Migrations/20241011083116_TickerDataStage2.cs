using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace simulator.Migrations
{
    /// <inheritdoc />
    public partial class TickerDataStage2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsStage2",
                table: "PriceData",
                type: "tinyint(1)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsStage2",
                table: "PriceData");
        }
    }
}
