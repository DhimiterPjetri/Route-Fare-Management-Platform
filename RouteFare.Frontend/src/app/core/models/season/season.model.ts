export interface SeasonDto {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  seasonType: SeasonType;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  modifiedAt?: Date;
}

export interface CreateSeasonDto {
  year: number;
  isActive: boolean;
}

export interface UpdateSeasonDto {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  seasonType: SeasonType;
  description?: string;
  isActive: boolean;
}

export interface SeasonFilterDto {
  year?: number;
  type?: SeasonType;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export enum SeasonType {
  Winter = 1,  // Jan-Jun
  Summer = 2   // Jul-Dec
}