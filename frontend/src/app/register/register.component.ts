import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserDTO } from '../models/User/userDTO';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [FormsModule, RouterModule],
  standalone: true,
})
export class RegisterComponent {
  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {}
  showPasswordInfo = false;
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
    this.responseMessage = 'Email has to have a valid format';
  }else if (this.data.password !== this.data.confirmPassword) {
    this.responseMessage = 'Passwords do not match.';
  } else {
    this.authService.register(this.data).subscribe({
      next: (res) => {
        console.log('Registration successful:', res);
        this.responseMessage = 'User registered successfully!';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error during registration:', err);
        this.responseMessage = 'Registration failed. Please try again.';
      },
    });
  }
}
}
