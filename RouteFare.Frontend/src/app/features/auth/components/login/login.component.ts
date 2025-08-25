import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginDto, UserRole } from '../../../../core/models/auth/auth.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const loginData: LoginDto = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Login successful, user role:', response.user.role);
          console.log('Full user response:', response.user);
          
          setTimeout(() => {
            console.log('After timeout - isAuthenticated:', this.authService.isAuthenticated());
            
            if (response.user.role === UserRole.Admin) {
              console.log('Navigating to admin dashboard');
              this.router.navigate(['/admin/dashboard']);
            } else if (response.user.role === UserRole.TourOperator) {
              console.log('Navigating to tour-operator dashboard');
              this.router.navigate(['/tour-operator/dashboard']);
            } else {
              console.error('Unknown user role:', response.user.role);
            }
          }, 100);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }
}