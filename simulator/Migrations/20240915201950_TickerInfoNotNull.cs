using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace simulator.Migrations
{
    /// <inheritdoc />
    public partial class TickerInfoNotNull : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PriceData_Tickers_TickerInfoTicker",
                table: "PriceData");

            migrationBuilder.AlterColumn<string>(
                name: "TickerInfoTicker",
                table: "PriceData",
                type: "varchar(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(255)")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_PriceData_Tickers_TickerInfoTicker",
                table: "PriceData",
                column: "TickerInfoTicker",
                principalTable: "Tickers",
                principalColumn: "Ticker");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PriceData_Tickers_TickerInfoTicker",
                table: "PriceData");

            migrationBuilder.UpdateData(
                table: "PriceData",
                keyColumn: "TickerInfoTicker",
                keyValue: null,
                column: "TickerInfoTicker",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "TickerInfoTicker",
                table: "PriceData",
                type: "varchar(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(255)",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_PriceData_Tickers_TickerInfoTicker",
                table: "PriceData",
                column: "TickerInfoTicker",
                principalTable: "Tickers",
                principalColumn: "Ticker",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
