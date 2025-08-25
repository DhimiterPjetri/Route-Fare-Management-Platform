export interface PricingDto {
  id: number;
  tourOperatorId: number;
  routeId: number;
  seasonId: number;
  bookingClassId: number;
  date: Date;
  price: number;
  requestedSeats: number;
  tourOperatorName: string;
  routeCode: string;
  seasonName: string;
  bookingClassName: string;
  createdAt: Date;
  modifiedAt?: Date;
}

export interface UpdatePricingDto {
  tourOperatorRouteId: number;
  updates: PricingUpdateItemDto[];
}

export interface PricingUpdateItemDto {
  date: Date;
  bookingClassId: number;
  price: number;
  requestedSeats: number;
}

export interface PricingFilterDto {
  tourOperatorId?: number;
  routeId?: number;
  seasonId?: number;
  bookingClassId?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}