import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../services/address.service';
import { Address } from '../models/order.model';

@Component({
  selector: 'app-saved-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './saved-addresses.component.html',
  styleUrls: ['./saved-addresses.component.css']
})
export class SavedAddressesComponent implements OnInit {
  addresses: Address[] = [];
  isLoading = true;
  showForm = false;
  editingId: number | null = null;

  form: Partial<Address> = this.emptyForm();

  successMsg = '';
  errorMsg = '';

  constructor(private addressService: AddressService) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  private emptyForm(): Partial<Address> {
    return {
      label: '',
      first_name: '',
      last_name: '',
      street: '',
      city: '',
      postal_code: '',
      country: 'Germany',
      phone: '',
      is_default: false
    };
  }

  loadAddresses(): void {
    this.isLoading = true;
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        this.addresses = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMsg = 'We couldn\'t load your addresses. Please try again.';
        this.isLoading = false;
      }
    });
  }

  openAddForm(): void {
    this.form = this.emptyForm();
    this.editingId = null;
    this.showForm = true;
    this.clearMessages();
  }

  editAddress(addr: Address): void {
    this.form = { ...addr };
    this.editingId = addr.address_id ?? null;
    this.showForm = true;
    this.clearMessages();
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  saveAddress(): void {
    this.clearMessages();
    if (this.editingId) {
      this.addressService.updateAddress(this.editingId, this.form).subscribe({
        next: () => {
          this.successMsg = 'Address updated successfully.';
          this.showForm = false;
          this.editingId = null;
          this.loadAddresses();
        },
        error: () => { this.errorMsg = 'We couldn\'t update this address. Please try again.'; }
      });
    } else {
      this.addressService.createAddress(this.form).subscribe({
        next: () => {
          this.successMsg = 'Address added successfully.';
          this.showForm = false;
          this.loadAddresses();
        },
        error: () => { this.errorMsg = 'We couldn\'t save your address. Please try again.'; }
      });
    }
  }

  deleteAddress(id: number): void {
    this.clearMessages();
    this.addressService.deleteAddress(id).subscribe({
      next: () => {
        this.successMsg = 'Address deleted.';
        this.loadAddresses();
      },
      error: () => { this.errorMsg = 'We couldn\'t delete this address. Please try again.'; }
    });
  }

  private clearMessages(): void {
    this.successMsg = '';
    this.errorMsg = '';
  }
}
