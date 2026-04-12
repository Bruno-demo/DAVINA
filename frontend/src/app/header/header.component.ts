import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { CartService } from '../services/cart.service';
import { ThemeService } from '../services/theme.service';
import { Subscription } from 'rxjs';
import { Roles } from '../../../shared/enums/role.enum';
import { StoreSwitcherComponent } from '../shared/store-switcher/store-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule, SearchbarComponent, StoreSwitcherComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  showCart = false;
  isNavOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  isOwner = false;
  cartItemCount = 0;

  userInfoVisible = false;
  private subscriptions = new Subscription();

  constructor(
    private authService: AuthenticationService,
    private cartService: CartService,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
      if (status) {
        this.loadCartCount();
      } else {
        this.cartItemCount = this.cartService.getGuestCartCount();
      }
    });
    this.authService.userRole$.subscribe((role) => {
      this.isAdmin = role === Roles.ADMIN;
      this.isOwner = role === Roles.USER;
    });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.cartService.cartUpdated$.subscribe(() => this.loadCartCount())
    );
    // Load guest cart count on init if not logged in
    if (!this.isLoggedIn) {
      this.cartItemCount = this.cartService.getGuestCartCount();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadCartCount(): void {
    if (!this.isLoggedIn) {
      this.cartItemCount = this.cartService.getGuestCartCount();
      return;
    }
    this.cartService.getMyCart().subscribe({
      next: (res) => {
        const items = res.ordered_items || [];
        this.cartItemCount = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      },
      error: () => {
        this.cartItemCount = this.cartService.getGuestCartCount();
      }
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
