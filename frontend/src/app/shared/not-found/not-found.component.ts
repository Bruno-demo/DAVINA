import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="not-found">
      <div class="not-found-content">
        <span class="not-found-code">404</span>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div class="not-found-actions">
          <a routerLink="/" class="btn-primary">Back to Home</a>
          <a routerLink="/products" class="btn-secondary">Browse Products</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      padding: 2rem;
    }
    .not-found-code {
      font-family: var(--font-display, 'Playfair Display', serif);
      font-size: clamp(5rem, 15vw, 10rem);
      font-weight: 700;
      color: var(--color-orange, #f24901);
      line-height: 1;
      opacity: 0.15;
      display: block;
    }
    .not-found h1 {
      font-family: var(--font-display, 'Playfair Display', serif);
      font-size: 2rem;
      margin: 0.5rem 0;
    }
    .not-found p {
      color: var(--color-text-light, #666);
      margin-bottom: 2rem;
      font-size: 1.05rem;
    }
    .not-found-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary, .btn-secondary {
      padding: 0.75rem 2rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-primary {
      background: var(--color-orange, #f24901);
      color: #fff;
    }
    .btn-secondary {
      background: transparent;
      color: var(--color-dark, #1a1a1a);
      border: 2px solid var(--color-border, #e0ddd8);
    }
    .btn-primary:hover, .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  `]
})
export class NotFoundComponent {}
