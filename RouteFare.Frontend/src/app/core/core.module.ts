import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

// Import services, guards, and interceptors when created
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
// import { AuthInterceptor } from './interceptors/auth.interceptor';
// import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Guards
    AuthGuard,
    RoleGuard
    
    // Interceptors are now configured in app.config.ts for standalone applications
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}