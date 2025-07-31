import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  responseMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  login(form: NgForm): void {
    if (!form.valid) {
      this.responseMessage = 'Please fill out all fields correctly.';
      return;
    }

    this.isLoading = true;
    this.responseMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.handleSuccessfulLogin(response);
      },
      error: (error) => {
        this.handleLoginError(error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private handleSuccessfulLogin(response: any): void {
    const token = response?.token || response?.access_token;
    const role = this.getRoleFromResponse(response);

    if (!token) {
      this.responseMessage = 'Login successful but no token received';
      this.isLoading = false;
      return;
    }

    localStorage.setItem('token', token);

    console.log('Role from response:', role);
    console.log('Token stored:', !!token);

    setTimeout(() => {
      if (role && role.toLowerCase() === 'admin') {
        this.router.navigate(['/adminpage'])
          .then(() => console.log('Redirected to admin page'))
          .catch(err => console.error('Redirect error:', err));
      } else {
        this.router.navigate(['/'])
          .then(() => console.log('Redirected to home page'));
      }
    }, 100);
  }

  private getRoleFromResponse(response: any): string | null {
    
    return response?.user?.role ||
           response?.role ||
           response?.body?.user?.role ||
           this.authService.getDecodedToken()?.role;
  }

  private handleLoginError(error: any): void {
    console.error('Login failed:', error);
    this.isLoading = false;

    if (error.status === 401) {
      this.responseMessage = 'Invalid email or password';
    } else if (error.status === 0) {
      this.responseMessage = 'Network error. Please check your connection';
    } else {
      this.responseMessage = error.error?.message || 'Login failed. Please try again later';
    }
  }
}
