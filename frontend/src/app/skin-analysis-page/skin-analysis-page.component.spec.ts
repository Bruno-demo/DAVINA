import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkinAnalysisPageComponent } from './skin-analysis-page.component';
import { SkinAnalysisService } from '../services/skin-analysis.service';
import { ProductService } from '../services/product';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { of } from 'rxjs';
import { Product } from '../models/product.model';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SkinAnalysisPageComponent', () => {
  let component: SkinAnalysisPageComponent;
  let fixture: ComponentFixture<SkinAnalysisPageComponent>;
  let skinServiceSpy: jasmine.SpyObj<SkinAnalysisService>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let authServiceSpy: jasmine.SpyObj<AuthenticationService>;

  beforeEach(async () => {
    skinServiceSpy = jasmine.createSpyObj('SkinAnalysisService', [
      'analyseSkin',
    ]);
    productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getAllProducts',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthenticationService', [
      'isLoggedIn',
      'getUserId',
    ]);

    productServiceSpy.getAllProducts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SkinAnalysisPageComponent], // Standalone
      providers: [
        provideHttpClientTesting(),
        { provide: SkinAnalysisService, useValue: skinServiceSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: AuthenticationService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SkinAnalysisPageComponent);
    component = fixture.componentInstance;
  });

  it('should perform skin analysis and update result and filtered products', () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const userId = '123';
    const mockResponse = {
      diagnosis: 'Dry Skin',
      skinType: 'dry',
      skinAdvice: '',
      recommendedProducts: [],
    };
    const mockProducts: Product[] = [
      {
        _id: '1',
        p_name: 'Crème 1',
        skin_typ_target: 'dry',
        price: 12.99,
        effect: 'soothing' as any,
        image_url: 'creme1.jpg',
      },
    ];

    authServiceSpy.getUserId.and.returnValue(userId);
    skinServiceSpy.analyseSkin.and.returnValue(of(mockResponse));
    component.allProducts = mockProducts;

  
    component.analyzeImage(mockFile);

    expect(skinServiceSpy.analyseSkin).toHaveBeenCalledWith(mockFile, userId);
    expect(component.resultText).toContain('Dry Skin');
    expect(component.filteredProducts.length).toBe(1);
    expect(component.filteredProducts[0].skin_typ_target).toBe('dry');
    expect(component.showProducts).toBeTrue();
    expect(component.errorMessage).toBeNull();
  });
});
