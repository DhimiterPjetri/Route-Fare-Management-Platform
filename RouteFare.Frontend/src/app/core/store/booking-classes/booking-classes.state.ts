import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { BookingClassDto, BookingClassType } from '../../models/booking-class/booking-class.model';

export interface BookingClassesState extends EntityState<BookingClassDto> {
  isLoading: boolean;
  error: string | null;
  selectedBookingClassId: number | null;
  searchTerm: string;
  classTypeFilter: BookingClassType | null;
  isActiveFilter: boolean | null;
}

export const bookingClassesAdapter: EntityAdapter<BookingClassDto> = createEntityAdapter<BookingClassDto>({
  selectId: (bookingClass: BookingClassDto) => bookingClass.id,
  sortComparer: (a: BookingClassDto, b: BookingClassDto) => a.displayOrder - b.displayOrder
});

export const initialBookingClassesState: BookingClassesState = bookingClassesAdapter.getInitialState({
  isLoading: false,
  error: null,
  selectedBookingClassId: null,
  searchTerm: '',
  classTypeFilter: null,
  isActiveFilter: null
});