import { Component, OnInit } from '@angular/core';
import { Warencorb } from '../services/warencorb';
import { OrderService } from '../services/order';
import { Product } from '../models/product.model';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductwarencorbComponent } from '../productwarencorb/productwarencorb.component';
import { AuthenticationService,  } from '../services/authentication/authentication.service';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-liferungform',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductwarencorbComponent, RouterModule],
  templateUrl: './liferungform.component.html',
  styleUrls: ['./liferungform.component.css']
})

export class LiferungformComponent implements OnInit {
  cartItems: Array<{ product_id: string; quantity: number; price: number; name: string }> = [];
  productsMap = new Map<string, Product>();
  subtotal = 0;
  shippingCost = 5.5;
  total = 0;
  warenkorb: any = null;
  hideLiefFormTitles = false;

  email = '';
  country = 'Deutschland';
  firstName = '';
  lastName = '';
  company = '';
  address = '';
  additionalAddress = '';
  postalCode = '';
  city = '';
  phone = '';
  paymentMethod = 'Kreditkarte';

  loading = false;
  errorMsg = '';
  successMsg = '';

showLiefDetails = true;
  constructor(
    private warenkorbService: Warencorb,
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router,
    private authService: AuthenticationService,
  ) {}

  userDetails: any = {};

 ngOnInit(): void {
  this.loadCart();


  this.warenkorbService.cartUpdated$.subscribe(() => {
    this.loadCart(); 
  });

  this.authService.getUserDetails().subscribe({
      next: (data) => {
        this.userDetails = data;

        this.email = data?.email || '';

        const fullName = data?.name || '';
        const nameParts = fullName.trim().split(/\s+/);
        this.firstName = nameParts[0] || '';
        this.lastName = nameParts.slice(1).join(' ') || '';
      },
      error: (err) => {
        console.error('Failed to fetch user data', err);
      }
    });
}



  async loadCart(): Promise<void> {
    this.loading = true;
    try {
      const res = await this.warenkorbService.getMyWarenkorb().toPromise();
      this.cartItems = res?.ordered_items?.filter(
        (item: any) => item.product_id && item.price != null
      ).map((item: any) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      })) || [];

      await this.loadProductsDetails();
      this.calculateTotals();
      this.showLiefDetails = this.cartItems.length > 0;
    } catch (err) {
      this.errorMsg = 'Fehler beim Laden des Warenkorbs.';
      console.error('Warenkorb-Ladefehler:', err);
    } finally {
      this.loading = false;
    }
  }

  async loadProductsDetails(): Promise<void> {
    this.productsMap.clear();
    const promises = this.cartItems.map(item =>
      this.productService.getProductById(item.product_id).toPromise()
        .then(res => res && res.data ? { id: item.product_id, product: res.data } : null)
        .catch(err => {
          console.error(`Error loading product ${item.product_id}`, err);
          return null;
        })
    );
    const results = await Promise.all(promises);
    results.forEach(result => {
      if (result) {
        this.productsMap.set(result.id, result.product);
      }
    });
  }



  calculateTotals(): void {
    this.subtotal = this.cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * item.quantity,
      0
    );
    this.total = this.subtotal + this.shippingCost;
  }

  onQuantityChange(event: { id: string; quantity: number }): void {
    const itemIndex = this.cartItems.findIndex(i => i.product_id === event.id);
    if (itemIndex === -1) return;

    if (event.quantity <= 0) {
      this.onRemove(event.id);
    } else {
      this.warenkorbService.updateItemQuantity({
        product_id: event.id,
        quantity: event.quantity
      }).subscribe({
        next: () => {
          this.cartItems[itemIndex].quantity = event.quantity;
          this.calculateTotals();
        },
        error: (err) => {
          console.error('Fehler beim Aktualisieren der Menge', err);
          this.errorMsg = 'Fehler beim Aktualisieren der Menge.';
        }
      });
    }
  }


  onRemove(productId: string): void {
    this.warenkorbService.removeItem(productId).subscribe({
      next: (res) => {
        console.log('Remove API response:', res);
        this.cartItems = this.cartItems.filter(item => item.product_id !== productId);
        this.calculateTotals();
        this.showLiefDetails = this.cartItems.length > 0;
      },
      error: (err) => {
        console.error('Error removing product', err);
        this.errorMsg = 'Fehler beim Entfernen des Produkts.';
      }
    });
  }



  submitOrder(form: any): void {
    if (!form.valid) {
      this.errorMsg = 'Bitte füllen Sie alle Pflichtfelder korrekt aus.';
      return;
    }
    if (this.cartItems.length === 0) {
      this.errorMsg = 'Ihr Warenkorb ist leer.';
      return;
    }

    this.showLiefDetails = false;
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const orderData = {
      customerInfo: {
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        company: this.company,
        address: this.address,
        additionalAddress: this.additionalAddress,
        postalCode: this.postalCode,
        city: this.city,
        phone: this.phone,
        country: this.country,
        paymentMethod: this.paymentMethod
      },
      items: this.cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };


    this.orderService.createOrderFromWarenkorb(orderData).subscribe({
      next: () => {
        this.warenkorbService.clearWarenkorb().subscribe({
          next: () => {
            this.loading = false;
            this.successMsg = '✅ Bestellung erfolgreich aufgegeben! ';
            setTimeout(() => this.router.navigate(['/bestellungen']), 2000);
          },
          error: (err) => {
            this.loading = false;
            this.errorMsg = 'Warenkorb konnte nicht geleert werden.';
            console.error('Fehler beim Leeren des Warenkorbs', err);
          }
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Fehler bei der Bestellung. Bitte versuchen Sie es erneut.';
        console.error('Bestellfehler:', err);
      }
    });
  }
}