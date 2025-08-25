import { BookingClassDto } from '../booking-class/booking-class.model';

export interface TourOperatorRouteDto {
  id: number;
  tourOperatorId: number;
  routeId: number;
  seasonId: number;
  tourOperatorName: string;
  routeCode: string;
  seasonName: string;
  origin: string;
  destination: string;
  seasonStartDate: string;
  seasonEndDate: string;
  assignedAt: Date;
  createdAt: Date;
  isActive: boolean;
  availableBookingClasses: BookingClassDto[];
}

export interface AssignRoutesToSeasonDto {
  tourOperatorId: number;
  seasonId: number;
  routeIds: number[];
}