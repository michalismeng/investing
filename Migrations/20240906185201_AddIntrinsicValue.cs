using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace investing.Migrations
{
    /// <inheritdoc />
    public partial class AddIntrinsicValue : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "IntrinsicValue",
                table: "Valuations",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "TerminalValuePV",
                table: "Valuations",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<decimal>(
                name: "Value",
                table: "ValuationData",
                type: "decimal(19,4)",
                precision: 19,
                scale: 4,
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IntrinsicValue",
                table: "Valuations");

            migrationBuilder.DropColumn(
                name: "TerminalValuePV",
                table: "Valuations");

            migrationBuilder.AlterColumn<decimal>(
                name: "Value",
                table: "ValuationData",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(19,4)",
                oldPrecision: 19,
                oldScale: 4);
        }
    }
}
