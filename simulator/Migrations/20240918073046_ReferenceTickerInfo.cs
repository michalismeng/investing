using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace simulator.Migrations
{
    /// <inheritdoc />
    public partial class ReferenceTickerInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PriceData_Tickers_TickerInfoTicker",
                table: "PriceData");

            migrationBuilder.DropIndex(
                name: "IX_PriceData_TickerInfoTicker",
                table: "PriceData");

            migrationBuilder.DropColumn(
                name: "TickerInfoTicker",
                table: "PriceData");

            migrationBuilder.AddColumn<string>(
                name: "ReferenceTicker",
                table: "PriceData",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<decimal>(
                name: "RelativeStrength",
                table: "PriceData",
                type: "decimal(65,30)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PriceData_Tickers_Ticker",
                table: "PriceData");

            migrationBuilder.DropColumn(
                name: "ReferenceTicker",
                table: "PriceData");

            migrationBuilder.DropColumn(
                name: "RelativeStrength",
                table: "PriceData");

            migrationBuilder.AddColumn<string>(
                name: "TickerInfoTicker",
                table: "PriceData",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_PriceData_TickerInfoTicker",
                table: "PriceData",
                column: "TickerInfoTicker");

            migrationBuilder.AddForeignKey(
                name: "FK_PriceData_Tickers_TickerInfoTicker",
                table: "PriceData",
                column: "TickerInfoTicker",
                principalTable: "Tickers",
                principalColumn: "Ticker");
        }
    }
}
