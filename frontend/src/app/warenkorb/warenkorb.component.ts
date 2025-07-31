import { Component, HostBinding, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Warencorb } from '../services/warencorb';
import { Subscription } from 'rxjs';
import { ProductService } from '../services/product';
import { Product } from '../models/product.model';
import { ProductwarencorbComponent } from '../productwarencorb/productwarencorb.component';

interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
}

@Component({
  selector: 'app-warenkorb',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductwarencorbComponent],
  templateUrl: './warenkorb.component.html',
  styleUrls: ['./warenkorb.component.css']
})
export class WarenkorbComponent implements OnInit, OnDestroy {
  @HostBinding('class.open') open = false;
  private scrollListener!: () => void;
  private subscriptions = new Subscription();
  private originalOverflow = '';

  orderedItems: CartItem[] = [];
  productsMap = new Map<string, Product>();
  subtotal = 0;
  shipping = 5.5;
  total = 0;
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private warenkorbService: Warencorb,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.disableBodyScroll();
    requestAnimationFrame(() => this.open = true);
    this.loadWarenkorb();
  }

  ngOnDestroy(): void {
    this.enableBodyScroll();
    this.subscriptions.unsubscribe();
  }

  private disableBodyScroll(): void {
    this.originalOverflow = document.body.style.overflow;
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.scrollListener = this.renderer.listen('window', 'scroll', this.preventScroll);
  }

  private enableBodyScroll(): void {
    this.renderer.setStyle(document.body, 'overflow', this.originalOverflow);
    if (this.scrollListener) {
      this.scrollListener();
    }
  }

  private preventScroll = (event: Event): void => {
    window.scrollTo(0, 0);
    event.preventDefault();
    event.stopPropagation();
  };

  loadWarenkorb(): void {
    this.loading = true;
    const sub = this.warenkorbService.getMyWarenkorb().subscribe({
      next: async (res) => {
        this.orderedItems = res.ordered_items || [];
        await this.loadProductsDetails();
        this.calculateTotals();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cart', err);
        this.loading = false;
        this.error = 'Fehler beim Laden des Warenkorbs';
      }
    });
    this.subscriptions.add(sub);
  }

  async loadProductsDetails() {
    this.productsMap.clear();
    const promises = this.orderedItems.map(item =>
      this.productService.getProductById(item.product_id).toPromise()
        .then(res => res && res.data ? { id: item.product_id, product: res.data } : null)
        .catch(error => {
          console.error(`Error loading product ${item.product_id}`, error);
          return null;
        })
    );
    const results = await Promise.all(promises);
    for (const result of results) {
      if (result) {
        this.productsMap.set(result.id, result.product);
      }
    }
  }

  calculateTotals(): void {
    this.subtotal = this.orderedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    this.total = this.subtotal + this.shipping;
  }

  onQuantityChange(event: { id: string; quantity: number }): void {
    if (event.quantity === 0) {
      this.onRemove(event.id);
      return;
    }

    this.warenkorbService.updateItemQuantity({
      product_id: event.id,
      quantity: event.quantity
    }).subscribe({
      next: () => {
        const item = this.orderedItems.find(i => i.product_id === event.id);
        if (item) {
          item.quantity = event.quantity;
          this.calculateTotals();
        }
      },
      error: err => console.error('Error updating quantity', err)
    });
  }

  onRemove(productId: string): void {
    this.warenkorbService.removeItem(productId).subscribe({
      next: (res) => {
        console.log('Remove API response:', res);
        this.orderedItems = this.orderedItems.filter(item => item.product_id !== productId);
        this.productsMap.delete(productId);
        this.calculateTotals();
      },
      error: err => console.error('Error removing product', err)
    });
  }

  navigateToCheckout(): void {
    this.close();
    this.router.navigate(['/lieferungform']);
  }

  close(): void {
    this.open = false;
    setTimeout(() => {
      this.router.navigate([{ outlets: { modal: null } }], { relativeTo: this.route.parent });
      this.enableBodyScroll();
    }, 300);
  }
}
