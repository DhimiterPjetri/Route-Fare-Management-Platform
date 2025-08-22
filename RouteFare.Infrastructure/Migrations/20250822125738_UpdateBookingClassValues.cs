using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RouteFare.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBookingClassValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "BookingClasses",
                keyColumn: "Id",
                keyValue: 1,
                column: "Code",
                value: "E");

            migrationBuilder.UpdateData(
                table: "BookingClasses",
                keyColumn: "Id",
                keyValue: 2,
                column: "Code",
                value: "PE");

            migrationBuilder.UpdateData(
                table: "BookingClasses",
                keyColumn: "Id",
                keyValue: 3,
                column: "Code",
                value: "B");

            migrationBuilder.UpdateData(
                table: "BookingClasses",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Code", "Name" },
                values: new object[] { "FC", "First Class" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "BookingClasses",
                keyColumn: "Id",
                keyValue: 1,
                column: "Code",
                value: "Y");

            migrationBuilder.UpdateData(
                table: "BookingClasses",
                keyColumn: "Id",
                keyValue: 2,
                column: "Code",
                value: "W");

            migrationBuilder.UpdateData(
                table: "BookingClasses",
                keyColumn: "Id",
                keyValue: 3,
                column: "Code",
                value: "C");

            migrationBuilder.UpdateData(
                table: "BookingClasses",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "Code", "Name" },
                values: new object[] { "F", "First" });
        }
    }
}
