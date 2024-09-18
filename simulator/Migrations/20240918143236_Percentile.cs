using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace simulator.Migrations
{
    /// <inheritdoc />
    public partial class Percentile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Percentile",
                table: "PriceData",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Percentile",
                table: "PriceData");

            migrationBuilder.AddForeignKey(
                name: "FK_PriceData_Tickers_Ticker",
                table: "PriceData",
                column: "Ticker",
                principalTable: "Tickers",
                principalColumn: "Ticker",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
