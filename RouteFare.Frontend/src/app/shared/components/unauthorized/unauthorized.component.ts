import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  standalone: false,
  template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-card-content>
          <div class="icon-container">
            <mat-icon class="warning-icon">warning</mat-icon>
          </div>
          <h2>Unauthorized Access</h2>
          <p>You do not have permission to access this page.</p>
          <div class="actions">
            <button mat-raised-button color="primary" routerLink="/auth/login">
              Go to Login
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
      padding: 20px;
    }

    .unauthorized-card {
      text-align: center;
      max-width: 400px;
      padding: 24px;
    }

    .icon-container {
      margin-bottom: 16px;
    }

    .warning-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ff9800;
    }

    h2 {
      color: #333;
      margin-bottom: 16px;
    }

    p {
      color: #666;
      margin-bottom: 24px;
    }

    .actions {
      margin-top: 24px;
    }
  `]
})
export class UnauthorizedComponent { }