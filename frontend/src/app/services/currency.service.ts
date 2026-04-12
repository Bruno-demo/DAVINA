import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Currency = 'RWF' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyOption {
  code: Currency;
  symbol: string;
  label: string;
  flag: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'RWF', symbol: 'RWF', label: 'Rwandan Franc',  flag: '🇷🇼' },
  { code: 'USD', symbol: '$',   label: 'US Dollar',       flag: '🇺🇸' },
  { code: 'EUR', symbol: '€',   label: 'Euro',            flag: '🇪🇺' },
  { code: 'GBP', symbol: '£',   label: 'British Pound',   flag: '🇬🇧' },
];

/** Exchange rates relative to RWF (base stored in DB) */
const RATES: Record<Currency, number> = {
  RWF: 1,
  USD: 0.00073,
  EUR: 0.00068,
  GBP: 0.00058,
};

const STORAGE_KEY = 'davina_currency';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private _current = new BehaviorSubject<Currency>(this.loadSaved());
  current$ = this._current.asObservable();

  get current(): Currency { return this._current.value; }
  get currentOption(): CurrencyOption { return CURRENCIES.find(c => c.code === this.current)!; }
  get options(): CurrencyOption[] { return CURRENCIES; }

  setCurrency(code: Currency): void {
    localStorage.setItem(STORAGE_KEY, code);
    this._current.next(code);
  }

  /**
   * Convert a price from RWF base to the selected currency and format it.
   * @param rwfPrice  Price as stored in MongoDB (RWF base)
   * @param currency  Override currency (optional, defaults to selected)
   */
  format(rwfPrice: number, currency?: Currency): string {
    const code = currency ?? this.current;
    const rate = RATES[code];
    const converted = rwfPrice * rate;
    const opt = CURRENCIES.find(c => c.code === code)!;

    if (code === 'RWF') {
      return `${opt.symbol} ${Math.round(converted).toLocaleString('en-RW')}`;
    }
    return `${opt.symbol}${converted.toFixed(2)}`;
  }

  private loadSaved(): Currency {
    const saved = localStorage.getItem(STORAGE_KEY) as Currency | null;
    return saved && RATES[saved] !== undefined ? saved : 'RWF';
  }
}
