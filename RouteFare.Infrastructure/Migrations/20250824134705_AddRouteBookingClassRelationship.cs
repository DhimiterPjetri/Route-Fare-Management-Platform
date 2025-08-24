using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RouteFare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRouteBookingClassRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RouteBookingClasses",
                columns: table => new
                {
                    RouteId = table.Column<int>(type: "int", nullable: false),
                    BookingClassId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RouteBookingClasses", x => new { x.RouteId, x.BookingClassId });
                    table.ForeignKey(
                        name: "FK_RouteBookingClasses_BookingClasses_BookingClassId",
                        column: x => x.BookingClassId,
                        principalTable: "BookingClasses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RouteBookingClasses_Routes_RouteId",
                        column: x => x.RouteId,
                        principalTable: "Routes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RouteBookingClasses_BookingClassId",
                table: "RouteBookingClasses",
                column: "BookingClassId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RouteBookingClasses");
        }
    }
}
