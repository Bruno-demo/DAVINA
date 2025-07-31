import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { Roles } from '../../../shared/enums/role.enum';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    const userRole = this.authService.getUserRole();
    if (userRole === Roles.ADMIN) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
