import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../models/product.model';

export interface HeroSlide {
  tag: string;
  title: string;
  subtitle: string;
  primaryBtn: { label: string; link: string };
  secondaryBtn: { label: string; link: string };
  image: string;
  imageAlt: string;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterModule, CommonModule, ProductCardComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit, OnDestroy {
  featuredProducts: Product[] = [];

  /* ── Hero Slider ── */
  heroSlides: HeroSlide[] = [
    {
      tag: 'Nature Distilled',
      title: 'Radiance Rooted in Rwanda',
      subtitle: 'Luxury skincare, fragrances, makeup & accessories crafted from organic ingredients, ethically sourced from the heart of Africa.',
      primaryBtn: { label: 'Explore Products', link: '/products' },
      secondaryBtn: { label: 'Take the Quiz', link: '/skin-type' },
      image: 'assets/images/photo-prodoktepage.png',
      imageAlt: 'Beauty products'
    },
    {
      tag: 'Discover Your Skin',
      title: 'Personalized Skincare Routine',
      subtitle: 'Take our AI-powered analysis and quiz to discover products perfectly matched to your unique skin type and concerns.',
      primaryBtn: { label: 'Start Analysis', link: '/skin-analysis' },
      secondaryBtn: { label: 'Skin Type Quiz', link: '/skin-type' },
      image: 'assets/images/Analyser.jpg',
      imageAlt: 'Skin analysis'
    },
    {
      tag: 'Clean Beauty',
      title: 'Science Meets Nature',
      subtitle: '100% vegan, cruelty-free formulations backed by dermatological research. No parabens, no silicones — just pure results.',
      primaryBtn: { label: 'Shop Now', link: '/products' },
      secondaryBtn: { label: 'Our Story', link: '/about' },
      image: 'assets/images/unsereprodukte2.avif',
      imageAlt: 'Natural beauty products'
    },
    {
      tag: 'Ethically Sourced',
      title: 'From Rwanda With Love',
      subtitle: 'Every ingredient tells a story of sustainable farming, fair trade partnerships, and deep respect for the land and its people.',
      primaryBtn: { label: 'View Collection', link: '/products' },
      secondaryBtn: { label: 'Learn More', link: '/about' },
      image: 'assets/images/quiz2.jpg',
      imageAlt: 'Rwanda ingredients'
    }
  ];

  currentSlide = 0;
  slideDirection: 'next' | 'prev' = 'next';
  animating = false;
  private autoPlayInterval: any;
  private readonly AUTOPLAY_MS = 6000;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProductsPaginated(1, 8).subscribe({
      next: (res) => this.featuredProducts = res.data,
      error: () => {}
    });
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  goToSlide(index: number): void {
    if (index === this.currentSlide || this.animating) return;
    this.slideDirection = index > this.currentSlide ? 'next' : 'prev';
    this.animating = true;
    this.currentSlide = index;
    this.restartAutoPlay();
    setTimeout(() => (this.animating = false), 700);
  }

  nextSlide(): void {
    this.goToSlide((this.currentSlide + 1) % this.heroSlides.length);
  }

  prevSlide(): void {
    this.goToSlide((this.currentSlide - 1 + this.heroSlides.length) % this.heroSlides.length);
  }

  startAutoPlay(): void {
    this.autoPlayInterval = setInterval(() => this.nextSlide(), this.AUTOPLAY_MS);
  }

  stopAutoPlay(): void {
    clearInterval(this.autoPlayInterval);
  }

  restartAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
