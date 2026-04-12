import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../services/wishlist.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlistItems: any[] = [];
  loading = true;

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.wishlistService.getWishlist().subscribe({
      next: (data) => {
        this.wishlistItems = data?.items || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  removeFromWishlist(productId: string): void {
    this.wishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.wishlistItems = this.wishlistItems.filter(i => 
          (i.product_id?._id || i.product_id) !== productId
        );
      }
    });
  }

  addToCart(item: any): void {
    const product = item.product_id;
    if (product && product._id) {
      this.cartService.addItem({ product_id: product._id, quantity: 1 }).subscribe({
        next: () => {
          this.removeFromWishlist(product._id);
        }
      });
    }
  }
}
