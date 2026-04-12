import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../services/analytics.service';
import { DashboardStats } from '../models/order.model';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.css']
})
export class AnalyticsDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  importProducts = '';
  importMessage = '';

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.analyticsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  exportOrders(): void {
    this.analyticsService.exportOrdersCsv().subscribe({
      next: (blob) => this.downloadBlob(blob, 'orders.csv')
    });
  }

  exportProducts(): void {
    this.analyticsService.exportProductsCsv().subscribe({
      next: (blob) => this.downloadBlob(blob, 'products.csv')
    });
  }

  bulkImport(): void {
    try {
      const products = JSON.parse(this.importProducts);
      this.analyticsService.bulkImportProducts(products).subscribe({
        next: (res) => {
          this.importMessage = res.message;
          this.importProducts = '';
        },
        error: (err) => {
          this.importMessage = err.error?.message || 'Import failed.';
        }
      });
    } catch {
      this.importMessage = 'Invalid JSON format.';
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getMaxRevenue(): number {
    if (!this.stats?.topProducts.length) return 1;
    return Math.max(...this.stats.topProducts.map(p => p.revenue));
  }
}
