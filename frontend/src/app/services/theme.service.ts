import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'davina-theme';
  private _isDark = false;

  get isDark(): boolean {
    return this._isDark;
  }

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'dark') {
      this._isDark = true;
    } else if (saved === 'light') {
      this._isDark = false;
    } else {
      this._isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.applyTheme();
  }

  toggle(): void {
    this._isDark = !this._isDark;
    localStorage.setItem(this.STORAGE_KEY, this._isDark ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.setAttribute('data-theme', this._isDark ? 'dark' : 'light');
  }
}
