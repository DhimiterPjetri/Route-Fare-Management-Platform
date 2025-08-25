import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ExportProgressDto } from '../models/export/export.model';
import * as ExportActions from '../store/export/export.actions';
import { AppState } from '../store/app.state';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection?: HubConnection;
  private connectionStateSubject = new BehaviorSubject<'Connected' | 'Disconnected' | 'Connecting'>('Disconnected');
  private exportProgressSubject = new BehaviorSubject<ExportProgressDto | null>(null);

  public connectionState$ = this.connectionStateSubject.asObservable();
  public exportProgress$ = this.exportProgressSubject.asObservable();

  constructor(
    private authService: AuthService,
    private store: Store<AppState>
  ) {}

  async startConnection(): Promise<void> {
    if (this.hubConnection?.state === 'Connected') {
      return;
    }

    const token = this.authService.getToken();
    
    if (!token) {
      console.warn('No authentication token available for SignalR connection');
      return;
    }

    this.connectionStateSubject.next('Connecting');

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(environment.signalRUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventHandlers();

    try {
      await this.hubConnection.start();
      this.connectionStateSubject.next('Connected');
      console.log('SignalR connection started successfully');
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.connectionStateSubject.next('Disconnected');
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.hubConnection) {
      return;
    }

    this.hubConnection.on('ExportProgress', (data: ExportProgressDto) => {
      console.log('Export progress received:', data);
      this.exportProgressSubject.next(data);
      
      this.store.dispatch(ExportActions.updateProgress({ progress: data }));
      
      if (data.isComplete || data.progress >= 100) {
        this.store.dispatch(ExportActions.exportComplete());
      }
    });

    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.connectionStateSubject.next('Connecting');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.connectionStateSubject.next('Connected');
    });

    this.hubConnection.onclose((error) => {
      console.log('SignalR connection closed', error);
      this.connectionStateSubject.next('Disconnected');
    });
  }

  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      try {
        await this.hubConnection.stop();
        this.connectionStateSubject.next('Disconnected');
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
        throw error;
      }
    }
  }

  isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }

  clearProgress(): void {
    this.exportProgressSubject.next(null);
  }
}