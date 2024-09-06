using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace investing.Migrations
{
    /// <inheritdoc />
    public partial class AddValuationInput : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DDMValuationInputs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ValuationId = table.Column<int>(type: "int", nullable: true),
                    DividendWitholdingTax = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    BaseEPS = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    GraduallyAdjust = table.Column<bool>(type: "bit", nullable: false),
                    EpsGrowth = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    PayoutRatio = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    ReturnRate = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    GrowthYears = table.Column<int>(type: "int", nullable: false),
                    StableEPSGrowth = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    StablePayoutRatio = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false),
                    StableReturnRate = table.Column<decimal>(type: "decimal(19,4)", precision: 19, scale: 4, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DDMValuationInputs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DDMValuationInputs_Valuations_ValuationId",
                        column: x => x.ValuationId,
                        principalTable: "Valuations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_DDMValuationInputs_ValuationId",
                table: "DDMValuationInputs",
                column: "ValuationId",
                unique: true,
                filter: "[ValuationId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DDMValuationInputs");
        }
    }
}
