import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { Roles } from '../../../shared/enums/role.enum';
import { Observable} from 'rxjs';
import { map, take } from 'rxjs/operators'


@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  canActivate(): Observable<boolean> {
  return this.authService.userRole$.pipe(
    take(1),
    map((role) => {
      if (role === Roles.USER) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    })
  );
}

}
