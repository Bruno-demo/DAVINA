import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService, CURRENCIES, Currency } from '../../services/currency.service';

@Component({
  selector: 'app-store-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="switcher-wrap">

    <!-- Currency trigger -->
    <button class="sw-btn" (click)="toggleCurr($event)" [attr.aria-label]="'Currency: ' + currSvc.current">
      <span class="sw-code">{{ currSvc.currentOption.symbol }}</span>
      <span class="sw-label">{{ currSvc.current }}</span>
      <i class="fa-solid fa-chevron-down sw-caret" [class.open]="currOpen"></i>
    </button>

    <!-- Currency dropdown -->
    <div class="sw-dropdown" *ngIf="currOpen">
      <button
        *ngFor="let opt of currOptions"
        class="sw-option"
        [class.active]="opt.code === currSvc.current"
        (click)="pickCurr(opt.code)"
      >
        <span class="flag">{{ opt.flag }}</span>
        <span>{{ opt.symbol }} {{ opt.code }}</span>
        <span class="sw-opt-label">{{ opt.label }}</span>
      </button>
    </div>

  </div>
  `,
  styles: [`
    .switcher-wrap {
      position: relative;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .sw-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px;
      color: rgba(255,255,255,0.75);
      font-size: 0.78rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .sw-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .sw-code { font-weight: 700; }
    .sw-label { font-size: 0.7rem; opacity: 0.8; }
    .flag { font-size: 1rem; line-height: 1; }
    .sw-caret { font-size: 0.6rem; transition: transform 0.2s ease; }
    .sw-caret.open { transform: rotate(180deg); }

    .sw-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 160px;
      background: #1e1e1e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      z-index: 1000;
    }

    .sw-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 14px;
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.7);
      font-size: 0.82rem;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
    }
    .sw-option:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .sw-option.active { color: #f24901; font-weight: 600; }
    .sw-opt-label { font-size: 0.7rem; color: rgba(255,255,255,0.4); margin-left: auto; }

    :host-context([data-theme="light"]) .sw-btn,
    :host-context(:not([data-theme="dark"])) .sw-btn {
      border-color: rgba(0,0,0,0.15);
      color: rgba(26,26,26,0.75);
    }
    :host-context([data-theme="light"]) .sw-btn:hover { background: rgba(0,0,0,0.05); color: #1a1a1a; }
  `]
})
export class StoreSwitcherComponent {
  currOpen = false;
  currOptions = CURRENCIES;

  constructor(public currSvc: CurrencyService) {}

  toggleCurr(e: Event): void {
    e.stopPropagation();
    this.currOpen = !this.currOpen;
  }

  pickCurr(code: Currency): void {
    this.currSvc.setCurrency(code);
    this.currOpen = false;
  }

  @HostListener('document:click')
  closeAll(): void {
    this.currOpen = false;
  }
}
