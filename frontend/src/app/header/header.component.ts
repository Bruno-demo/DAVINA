import { Component, HostListener } from '@angular/core';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { Roles } from '../../../shared/enums/role.enum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, SearchbarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  showCart = false;
  isNavOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  isOwner = false;

  userInfoVisible = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
    this.authService.userRole$.subscribe((role) => {
      this.isAdmin = role === Roles.ADMIN;
      this.isOwner = role === Roles.USER;
    });
  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
    document.body.style.overflow = this.isNavOpen ? 'hidden' : '';
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 768) {
      this.isNavOpen = false;
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.user_icon') || target.closest('.user_info_popup');
    if (!clickedInside) {
      this.userInfoVisible = false;
    }
  }

  toggleUserIconClick() {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.userInfoVisible = !this.userInfoVisible;
    }
  }

  onNavLinkClick() {
    if (this.isNavOpen) {
      this.toggleNav();
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/register']);
      },
      error: (err) => console.error('Logout failed:', err)
    });
  }
}
