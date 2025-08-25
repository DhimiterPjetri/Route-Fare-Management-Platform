export interface PricingTableDto {
  tourOperatorId: number;
  routeId: number;
  seasonId: number;
  tourOperatorName: string;
  routeCode: string;
  seasonName: string;
  rows: PricingRowDto[];
}

export interface PricingRowDto {
  date: Date;
  dayOfWeek: string;
  classPricing: ClassPricingDto[];
}

export interface ClassPricingDto {
  bookingClassId: number;
  bookingClassName: string;
  bookingClassCode: string;
  price: number;
  requestedSeats: number;
}