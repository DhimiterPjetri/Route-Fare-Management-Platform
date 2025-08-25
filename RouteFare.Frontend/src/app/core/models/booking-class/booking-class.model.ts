export interface BookingClassDto {
  id: number;
  name: string;
  code: string;
  classType: BookingClassType;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  multiplier?: number;
  createdAt: Date;
  modifiedAt?: Date;
}

export interface CreateBookingClassDto {
  name: string;
  code: string;
  classType: BookingClassType;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateBookingClassDto {
  id: number;
  name: string;
  code: string;
  classType: BookingClassType;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export enum BookingClassType {
  Economy = 0,
  PremiumEconomy = 1,
  Business = 2,
  FirstClass = 3
}