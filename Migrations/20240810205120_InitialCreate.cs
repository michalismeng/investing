using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace investing.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Valuations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Report = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Valuations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ValuationData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ValuationId = table.Column<int>(type: "int", nullable: false),
                    Characteristic = table.Column<int>(type: "int", nullable: false),
                    Ordinal = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ValuationData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ValuationData_Valuations_ValuationId",
                        column: x => x.ValuationId,
                        principalTable: "Valuations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ValuationData_ValuationId",
                table: "ValuationData",
                column: "ValuationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ValuationData");

            migrationBuilder.DropTable(
                name: "Valuations");
        }
    }
}
