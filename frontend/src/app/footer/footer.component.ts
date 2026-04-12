import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { Router, RouterModule } from '@angular/router';
import { Roles } from '../../../shared/enums/role.enum';
import { NewsletterComponent } from '../newsletter/newsletter.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [NewsletterComponent, RouterModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
   isLoggedIn = false;
  isAdmin = false;
  isOwner = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
    this.authService.userRole$.subscribe((role) => {
      this.isAdmin = role === Roles.ADMIN;
      this.isOwner = role === Roles.USER;
    });
  }
}
