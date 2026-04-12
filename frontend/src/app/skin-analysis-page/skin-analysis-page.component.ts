import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product';
import { SkinAnalysisService, SkinAnalysisResponse } from '../services/skin-analysis.service';
import { AuthenticationService } from '../services/authentication/authentication.service';


@Component({
  selector: 'app-skin-analysis-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent 
  ],
  templateUrl: './skin-analysis-page.component.html',
  styleUrls: ['./skin-analysis-page.component.css']
})
export class SkinAnalysisPageComponent {
  selectedImageUrl: string | null = null;
  selectedFile: File | null = null;
  showResult = false;
  resultText = '';
  showProducts = false;
  isLoading = false;
  errorMessage: string | null = null;

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(
    private productService: ProductService,
    private skinService: SkinAnalysisService,
    private authService: AuthenticationService
  ) {
    this.loadProducts();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get userId(): string | null {
    return this.authService.getUserId();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.allProducts = products;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.errorMessage = 'Error loading products.';
      }
    });
  }

  private formatSkinType(skinType: string): string {
    const normalized = skinType?.toLowerCase();

    if (normalized === 'dry') return 'Dry';
    if (normalized === 'oily') return 'Oily';
    if (normalized === 'combination') return 'Combination';
    if (normalized === 'normal') return 'Normal';

    return skinType;
  }

  analyzeImage(file: File) {
    if (!this.userId) {
      this.errorMessage = 'Please log in to start the analysis.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.resultText = 'Analyzing...';
    this.showResult = true;
    this.showProducts = false;

    this.skinService.analyseSkin(file, this.userId).subscribe({
      next: (response: SkinAnalysisResponse) => {
        this.resultText = `${response.diagnosis} | Skin type: ${this.formatSkinType(response.skinType)}`;
        this.filteredProducts = this.allProducts.filter(
          p => p.skin_typ_target.toLowerCase() === response.skinType.toLowerCase()
        );
        this.showProducts = this.filteredProducts.length > 0;
      },
      error: (err) => {
        console.error('Analysis error:', err);
        this.errorMessage = 'Analysis failed.';
        if (err?.error?.details) {
          this.errorMessage += ` ${err.error.details}`;
        }
        this.resultText = '';
        this.showResult = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!this.isLoggedIn) {
      this.errorMessage = 'You must be logged in to upload a photo.';
      return;
    }

    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      this.readImageFile(file);
      this.errorMessage = null;
    } else {
      this.errorMessage = 'Please upload a valid image.';
    }
  }

  startAnalysis() {
    if (!this.selectedFile) {
      this.errorMessage = 'Please upload an image first.';
      return;
    }
    if (!this.isLoggedIn) {
      this.errorMessage = 'Please log in to run an analysis.';
      return;
    }
    this.errorMessage = null;
    this.analyzeImage(this.selectedFile);
  }

  private readImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  triggerFileUpload(fileInput: HTMLInputElement) {
    if (!this.isLoggedIn) {
      this.errorMessage = 'Please log in to run an analysis.';
      return;
    }
    fileInput.click();
  }
}
