import { BookingClassDto } from '../booking-class/booking-class.model';

export interface RouteDto {
  id: number;
  origin: string;
  destination: string;
  routeCode: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  modifiedAt?: Date;
  availableBookingClasses: BookingClassDto[];
}

export interface CreateRouteDto {
  origin: string;
  destination: string;
  description?: string;
  isActive: boolean;
  bookingClassIds: number[];
}

export interface UpdateRouteDto {
  id: number;
  origin: string;
  destination: string;
  description?: string;
  isActive: boolean;
  bookingClassIds: number[];
}

export interface RouteFilterDto {
  searchTerm?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}