import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="back-to-top"
      [class.visible]="isVisible"
      (click)="scrollToTop()"
      aria-label="Back to top"
      title="Back to top">
      <i class="fa-solid fa-chevron-up"></i>
    </button>
  `,
  styles: [`
    .back-to-top {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 9000;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: var(--color-orange, #f24901);
      color: #fff;
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(242, 73, 1, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s;
    }
    .back-to-top.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .back-to-top:hover {
      background: var(--color-orange-hover, #d93f00);
      transform: translateY(-2px);
    }
    .back-to-top:focus-visible {
      outline: 2px solid var(--color-orange, #f24901);
      outline-offset: 2px;
    }
  `]
})
export class BackToTopComponent {
  isVisible = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.isVisible = window.scrollY > 400;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
