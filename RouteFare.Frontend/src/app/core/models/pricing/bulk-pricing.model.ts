export interface BulkPricingUpdateDto {
  tourOperatorRouteId: number;
  updateType: BulkUpdateType;
  daysOfWeek?: DayOfWeek[];
  startDate?: Date;
  endDate?: Date;
  classPrices: { [bookingClassId: number]: number };
  classSeats: { [bookingClassId: number]: number };
}

export enum BulkUpdateType {
  AllDays = 0,
  SpecificDaysOfWeek = 1,
  DateRange = 2
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6
}