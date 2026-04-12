import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product';
import { CartService } from '../services/cart.service';
import { WishlistService } from '../services/wishlist.service';
import { ReviewService } from '../services/review.service';
import { RecentlyViewedService } from '../services/recently-viewed.service';
import { ComparisonService } from '../services/comparison.service';
import { SeoService } from '../services/seo.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { Product } from '../models/product.model';
import { Review } from '../models/order.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  recentlyViewed: Product[] = [];
  isLoading = true;
  error: string | null = null;
  isAddingToCart = false;
  addToCartSuccess = false;
  addToCartError = '';
  quantity = 1;

  // Image gallery
  selectedImageIndex = 0;
  allImages: string[] = [];

  // Reviews
  reviews: Review[] = [];
  reviewPage = 1;
  reviewTotal = 0;
  showReviewForm = false;
  reviewRating = 5;
  reviewTitle = '';
  reviewComment = '';
  reviewSubmitting = false;
  reviewError = '';

  // Wishlist
  isInWishlist = false;
  wishlistLoading = false;

  // Variants
  selectedVariantIndex: number | null = null;
  effectivePrice = 0;

  // Tabs
  activeTab: 'description' | 'ingredients' | 'reviews' = 'description';

  // Comparison
  isInComparison = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private reviewService: ReviewService,
    private recentlyViewedService: RecentlyViewedService,
    private comparisonService: ComparisonService,
    private seoService: SeoService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  private loadProduct(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res.data;
        this.isLoading = false;

        // Build image gallery
        this.allImages = [];
        if (this.product.image_url) this.allImages.push(this.product.image_url);
        if (this.product.images?.length) {
          this.product.images.forEach(img => {
            if (!this.allImages.includes(img)) this.allImages.push(img);
          });
        }
        this.selectedImageIndex = 0;

        // Track recently viewed
        this.recentlyViewedService.addProduct(this.product);
        this.recentlyViewed = this.recentlyViewedService.getRecentlyViewed()
          .filter(p => p._id !== this.product!._id).slice(0, 4);

        this.loadRelatedProducts();
        this.loadReviews();
        if (this.authService.isLoggedIn()) {
          this.checkWishlist();
        }
        this.effectivePrice = this.product.price;
        this.isInComparison = this.comparisonService.isInComparison(this.product._id);

        // SEO meta tags
        this.seoService.updateProductMeta({
          name: this.product.p_name,
          description: this.product.p_description || '',
          image: this.product.image_url,
          price: this.product.price,
          id: this.product._id,
        });
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error = 'Product not found.';
        this.isLoading = false;
      }
    });
  }

  private loadRelatedProducts(): void {
    if (!this.product) return;
    this.productService.getRelatedProducts(this.product._id).subscribe({
      next: (products) => {
        this.relatedProducts = products.slice(0, 4);
      },
      error: () => {
        this.productService.getAllProducts().subscribe({
          next: (products) => {
            this.relatedProducts = products
              .filter(p => p._id !== this.product!._id && p.skin_typ_target === this.product!.skin_typ_target)
              .slice(0, 4);
          },
          error: () => {}
        });
      }
    });
  }

  private loadReviews(): void {
    if (!this.product) return;
    this.reviewService.getProductReviews(this.product._id, this.reviewPage).subscribe({
      next: (res) => {
        this.reviews = res.data || [];
        this.reviewTotal = res.total || 0;
      },
      error: () => {}
    });
  }

  private checkWishlist(): void {
    this.wishlistService.getWishlist().subscribe({
      next: (wishlist) => {
        this.isInWishlist = wishlist?.items?.some(
          (item: any) => item.product_id === this.product?._id || item.product_id?._id === this.product?._id
        ) || false;
      },
      error: () => {}
    });
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  selectVariant(index: number): void {
    this.selectedVariantIndex = index;
    if (this.product) {
      const variant = this.product.variants[index];
      this.effectivePrice = this.product.price + (variant?.price_modifier || 0);
    }
  }

  clearVariant(): void {
    this.selectedVariantIndex = null;
    if (this.product) this.effectivePrice = this.product.price;
  }

  toggleComparison(): void {
    if (!this.product) return;
    if (this.isInComparison) {
      this.comparisonService.removeProduct(this.product._id);
      this.isInComparison = false;
    } else {
      const added = this.comparisonService.addProduct(this.product);
      this.isInComparison = added;
    }
  }

  toggleWishlist(): void {
    if (!this.product) return;
    this.wishlistLoading = true;
    if (this.isInWishlist) {
      this.wishlistService.removeFromWishlist(this.product._id).subscribe({
        next: () => { this.isInWishlist = false; this.wishlistLoading = false; },
        error: () => { this.wishlistLoading = false; }
      });
    } else {
      this.wishlistService.addToWishlist(this.product._id).subscribe({
        next: () => { this.isInWishlist = true; this.wishlistLoading = false; },
        error: () => { this.wishlistLoading = false; }
      });
    }
  }

  submitReview(): void {
    if (!this.product) return;
    this.reviewSubmitting = true;
    this.reviewError = '';
    this.reviewService.createReview({
      product_id: this.product._id,
      rating: this.reviewRating,
      title: this.reviewTitle,
      comment: this.reviewComment
    }).subscribe({
      next: () => {
        this.reviewSubmitting = false;
        this.showReviewForm = false;
        this.reviewTitle = '';
        this.reviewComment = '';
        this.reviewRating = 5;
        this.loadReviews();
      },
      error: (err) => {
        this.reviewSubmitting = false;
        this.reviewError = err.error?.message || 'We couldn\'t submit your review. Please try again.';
      }
    });
  }

  shareOn(platform: string): void {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.product?.p_name || '');
    let shareUrl = '';
    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`; break;
      case 'pinterest': shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&description=${text}`; break;
    }
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating)).fill(0);
  }

  formatSkinType(skinType: string): string {
    const map: Record<string, string> = { dry: 'Dry', oily: 'Oily', combination: 'Combination', normal: 'Normal' };
    return map[skinType?.toLowerCase()] || skinType;
  }

  formatEffect(effect: string): string {
    const map: Record<string, string> = { hydration: 'Hydration', soothing: 'Soothing', mattifying: 'Mattifying', 'anti-aging': 'Anti-aging', 'anti-acne': 'Anti-acne' };
    return map[effect?.toLowerCase()] || effect;
  }

  increaseQty(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    if (!this.product) return;
    if (this.product.stock === 0) {
      this.addToCartError = 'This product is out of stock.';
      setTimeout(() => (this.addToCartError = ''), 3000);
      return;
    }
    if (this.quantity > this.product.stock) {
      this.quantity = this.product.stock;
    }
    this.isAddingToCart = true;
    this.addToCartSuccess = false;
    this.addToCartError = '';

    this.cartService.addItem({
      product_id: this.product._id,
      quantity: this.quantity,
      name: this.product.p_name,
      price: this.product.price
    }).subscribe({
      next: () => {
        this.isAddingToCart = false;
        this.addToCartSuccess = true;
        setTimeout(() => this.addToCartSuccess = false, 3000);
      },
      error: (err) => {
        this.isAddingToCart = false;
        this.addToCartError = err.error?.message || 'Something went wrong while adding to cart. Please try again.';
        setTimeout(() => this.addToCartError = '', 3000);
      }
    });
  }
}
