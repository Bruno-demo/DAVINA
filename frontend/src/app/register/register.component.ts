import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserDTO } from '../models/User/userDTO';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, RouterModule, CommonModule],
  standalone: true,
})
export class RegisterComponent {
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toastService: ToastService,
  ) {}
  showPasswordInfo = false;
  showPassword = false;
  showConfirmPassword = false;
  data: UserDTO & { confirmPassword: string } = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
};
responseMessage = '';


register(form: NgForm) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var email = (document.getElementById('email') as HTMLFormElement)['value'];

  if (!form.valid) {
    this.responseMessage = 'Please fill out all fields correctly.';
  } else if (!emailRegex.test(email)) {
    this.responseMessage = 'Please enter a valid email address (e.g. name@example.com).';
  }else if (this.data.password !== this.data.confirmPassword) {
    this.responseMessage = 'Passwords do not match. Please make sure both passwords are the same.';
  } else {
    this.authService.register(this.data).subscribe({
      next: (res) => {
        console.log('Registration successful:', res);
        this.responseMessage = 'User registered successfully!';
        this.toastService.success('Registration successful! Please log in.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error during registration:', err);
        this.responseMessage = err.error?.message || 'Registration failed. Please try again.';
        this.toastService.error(this.responseMessage);
      },
    });
  }
}
}
