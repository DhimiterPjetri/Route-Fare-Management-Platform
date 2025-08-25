import { BookingClassDto } from '../booking-class/booking-class.model';

export interface TourOperatorDto {
  id: number;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  bookingClasses?: BookingClassDto[];
  createdAt: Date;
  modifiedAt?: Date;
}

export interface CreateTourOperatorDto {
  name: string;
  code: string;
  contactEmail: string;
  contactPhone?: string;
  bookingClassIds: number[];
  initialUser?: CreateOperatorUserDto;
}

export interface UpdateTourOperatorDto {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  bookingClassIds?: number[];
}

export interface TourOperatorFilterDto {
  searchTerm?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateOperatorUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}