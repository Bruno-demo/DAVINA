import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product';
import { SkinAnalysisService, SkinAnalysisResponse } from '../services/skin-analysis.service';
import { AuthenticationService } from '../services/authentication/authentication.service';


@Component({
  selector: 'app-hautanalyse-page',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent 
  ],
  templateUrl: './hautanalyse-page.component.html',
  styleUrls: ['./hautanalyse-page.component.css']
})
export class HautanalysePageComponent {
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
        this.errorMessage = 'Fehler beim Laden der Produkte.';
      }
    });
  }

  analyzeImage(file: File) {
    if (!this.userId) {
      this.errorMessage = 'Bitte melde dich an, um die Analyse zu starten.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.resultText = 'Analyse läuft...';
    this.showResult = true;
    this.showProducts = false;

    this.skinService.analyseSkin(file, this.userId).subscribe({
      next: (response: SkinAnalysisResponse) => {
        this.resultText = ` ${response.diagnose} | Hauttyp: ${response.hauttyp}`;
        this.filteredProducts = this.allProducts.filter(
          p => p.skin_typ_target.toLowerCase() === response.hauttyp.toLowerCase()
        );
        this.showProducts = this.filteredProducts.length > 0;
      },
      error: (err) => {
        console.error('Analysefehler:', err);
        this.errorMessage = 'Analyse fehlgeschlagen.';
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
      this.errorMessage = 'Du musst dich einloggen, um ein Foto hochzuladen.';
      return;
    }

    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      this.readImageFile(file);
      this.errorMessage = null;
    } else {
      this.errorMessage = 'Bitte lade ein gültiges Bild hoch.';
    }
  }

  startAnalysis() {
    if (!this.selectedFile) {
      this.errorMessage = 'Bitte lade zuerst ein Bild hoch.';
      return;
    }
    if (!this.isLoggedIn) {
      this.errorMessage = 'Bitte melde dich an, um eine Analyse durchzuführen.';
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
      this.errorMessage = 'Bitte melde dich an, um eine Analyse durchzuführen.';
      return;
    }
    fileInput.click();
  }
}
