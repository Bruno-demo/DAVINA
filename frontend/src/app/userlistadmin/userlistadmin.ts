import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user';
import { Users } from '../models/users';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

interface UserViewModel extends Users {
  initials: string;
  avatarUrl?: string;
  showMenu?: boolean;
}

const Roles = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

@Component({
  selector: 'app-userlistadmin',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ],
  templateUrl: './userlistadmin.html',
  styleUrls: ['./userlistadmin.css']
})

export class Userlistadmin implements OnInit {
  users:  UserViewModel[] = [];

  constructor(
    private userService: UserService,
    private elementRef: ElementRef,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.users.forEach(u => u.showMenu = false);
    }
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data: Users[]) => {
        this.users = data.map((user) => ({
          ...user,
          initials: this.getInitials(user.u_name),
          avatarUrl: undefined 
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
      }
    });
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }


  toggleMenu(user: UserViewModel): void {
    const wasOpen = user.showMenu;
    this.users.forEach(u => u.showMenu = false);
    user.showMenu = !wasOpen;
  }

  changeRole(user: UserViewModel, newRole: string): void {
    this.userService.updateUserRole({
      userId: user.u_id,
      newRole: newRole 
    }).subscribe({
      next: (response) => {
        console.log('Role updated successfully', response);
        user.u_role = newRole;
        user.showMenu = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du rôle', err);
        alert(err.error?.error || 'Erreur lors de la mise à jour');
      }
    });
  }


}


