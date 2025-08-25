import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material/material.module';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { LeftMenuComponent } from './components/left-menu/left-menu.component';
import { ExportProgressComponent } from './components/export-progress/export-progress.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { StatusToggleDialogComponent } from './components/status-toggle-dialog/status-toggle-dialog.component';

@NgModule({
  declarations: [
    UnauthorizedComponent,
    PageHeaderComponent,
    LeftMenuComponent,
    ExportProgressComponent,
    ConfirmationDialogComponent,
    StatusToggleDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MaterialModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MaterialModule,
    UnauthorizedComponent,
    PageHeaderComponent,
    LeftMenuComponent,
    ExportProgressComponent,
    ConfirmationDialogComponent,
    StatusToggleDialogComponent
  ]
})
export class SharedModule { }