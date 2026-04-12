import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../services/user';
import { Users } from '../models/users';

@Component({
  selector: 'app-userlistadmin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './userlistadmin.html',
  styleUrls: ['./userlistadmin.css']
})
export class Userlistadmin implements OnInit {
  users: any[] = [];
  isLoading = true;
  searchQuery = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  constructor(
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (data: Users[]) => {
        this.users = data.map(user => ({
          ...user,
          newRole: user.u_role
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading = false;
      }
    });
  }

  get filteredUsers(): any[] {
    if (!this.searchQuery.trim()) return this.users;
    const q = this.searchQuery.toLowerCase();
    return this.users.filter(u =>
      u.u_name?.toLowerCase().includes(q) ||
      u.u_email?.toLowerCase().includes(q)
    );
  }

  get paginatedUsers(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  onSearch(): void {
    this.currentPage = 1;
  }

  saveRole(user: any): void {
    if (user.newRole === user.u_role) return;
    this.userService.updateUserRole({
      userId: user.u_id,
      newRole: user.newRole
    }).subscribe({
      next: () => {
        user.u_role = user.newRole;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error updating role:', err);
        user.newRole = user.u_role;
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    return role === 'admin' ? 'role-admin' : 'role-user';
  }

  verifyUser(user: any): void {
    this.userService.adminVerifyUser(user.u_id).subscribe({
      next: () => {
        user.is_verified = true;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error verifying user:', err);
      }
    });
  }

  deleteUser(user: any): void {
    if (!confirm(`Are you sure you want to delete user "${user.u_name || user.u_email}"?`)) return;
    this.userService.adminDeleteUser(user.u_id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.u_id !== user.u_id);
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting user:', err);
        alert(err.error?.message || 'Failed to delete user.');
      }
    });
  }
}


