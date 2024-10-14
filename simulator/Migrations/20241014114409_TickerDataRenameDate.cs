using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace simulator.Migrations
{
    /// <inheritdoc />
    public partial class TickerDataRenameDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Datetime",
                table: "PriceData",
                newName: "Date");

            migrationBuilder.RenameIndex(
                name: "IX_PriceData_Datetime",
                table: "PriceData",
                newName: "IX_PriceData_Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Date",
                table: "PriceData",
                newName: "Datetime");

            migrationBuilder.RenameIndex(
                name: "IX_PriceData_Date",
                table: "PriceData",
                newName: "IX_PriceData_Datetime");
        }
    }
}
