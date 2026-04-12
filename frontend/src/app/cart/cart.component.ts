import { Component, HostBinding, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../services/cart.service';
import { Subscription } from 'rxjs';
import { ProductService } from '../services/product';
import { Product } from '../models/product.model';
import { CartProductComponent } from '../cart-product/cart-product.component';

interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, CartProductComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
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
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.disableBodyScroll();
    requestAnimationFrame(() => this.open = true);
    this.loadCart();
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

  loadCart(): void {
    this.loading = true;
    const sub = this.cartService.getMyCart().subscribe({
      next: async (res) => {
        this.orderedItems = res.ordered_items || [];
        await this.loadProductsDetails();
        this.calculateTotals();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cart', err);
        this.loading = false;
        this.error = 'Error loading the cart.';
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

    this.cartService.updateItemQuantity({
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
    this.cartService.removeItem(productId).subscribe({
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
    this.router.navigate(['/checkout']);
  }

  close(): void {
    this.open = false;
    setTimeout(() => {
      this.router.navigate([{ outlets: { modal: null } }], { relativeTo: this.route.parent });
      this.enableBodyScroll();
    }, 300);
  }
}
