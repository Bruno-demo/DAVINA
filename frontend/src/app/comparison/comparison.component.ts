import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComparisonService } from '../services/comparison.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.css']
})
export class ComparisonComponent implements OnInit {
  products: Product[] = [];

  constructor(private comparisonService: ComparisonService) {}

  ngOnInit(): void {
    this.products = this.comparisonService.getProducts();
    this.comparisonService.updated$.subscribe(() => {
      this.products = this.comparisonService.getProducts();
    });
  }

  remove(id: string): void {
    this.comparisonService.removeProduct(id);
  }

  clearAll(): void {
    this.comparisonService.clear();
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating || 0)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.round(rating || 0)).fill(0);
  }
}
