import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { BookingClassDto, CreateBookingClassDto, UpdateBookingClassDto } from '../models/booking-class/booking-class.model';

@Injectable({
  providedIn: 'root'
})
export class BookingClassService {

  constructor(private apiService: ApiService) {}

  getBookingClasses(): Observable<BookingClassDto[]> {
    return this.apiService.get<BookingClassDto[]>('BookingClasses');
  }

  getBookingClass(id: number): Observable<BookingClassDto> {
    return this.apiService.get<BookingClassDto>(`BookingClasses/${id}`);
  }

  createBookingClass(bookingClass: CreateBookingClassDto): Observable<BookingClassDto> {
    return this.apiService.post<BookingClassDto>('BookingClasses', bookingClass);
  }

  updateBookingClass(bookingClass: UpdateBookingClassDto): Observable<BookingClassDto> {
    return this.apiService.put<BookingClassDto>(`BookingClasses/${bookingClass.id}`, bookingClass);
  }

  deleteBookingClass(id: number): Observable<void> {
    return this.apiService.delete<void>(`BookingClasses/${id}`);
  }

  getActiveBookingClasses(): Observable<BookingClassDto[]> {
    return this.apiService.get<BookingClassDto[]>('BookingClasses', { isActive: true });
  }

  getTourOperatorBookingClasses(tourOperatorId: number): Observable<BookingClassDto[]> {
    return this.apiService.get<BookingClassDto[]>(`BookingClasses/tour-operator/${tourOperatorId}`);
  }
}