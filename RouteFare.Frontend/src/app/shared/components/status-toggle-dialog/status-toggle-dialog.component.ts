import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface StatusToggleDialogData {
  objectType: string; 
  objectName: string; 
  currentStatus: boolean; 
  actionType: 'activate' | 'deactivate';
}

@Component({
  selector: 'app-status-toggle-dialog',
  templateUrl: './status-toggle-dialog.component.html',
  styleUrls: ['./status-toggle-dialog.component.scss'],
  standalone: false
})
export class StatusToggleDialogComponent {
  
  constructor(
    private dialogRef: MatDialogRef<StatusToggleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StatusToggleDialogData
  ) {}

  get actionText(): string {
    return this.data.actionType === 'activate' ? 'Activate' : 'Deactivate';
  }

  get actionTextLowerCase(): string {
    return this.actionText.toLowerCase();
  }

  get title(): string {
    return `${this.actionText} ${this.data.objectType}`;
  }

  get message(): string {
    return `Are you sure you want to ${this.actionTextLowerCase} "${this.data.objectName}"?`;
  }

  get confirmButtonText(): string {
    return `${this.actionText} ${this.data.objectType}`;
  }

  get isDestructiveAction(): boolean {
    return this.data.actionType === 'deactivate';
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}