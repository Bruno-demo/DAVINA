import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Lang = 'en' | 'fr' | 'rw';

export interface LangOption {
  code: Lang;
  label: string;
  native: string;
  flag: string;
}

export const LANGUAGES: LangOption[] = [
  { code: 'en', label: 'English',     native: 'English',    flag: '🇬🇧' },
  { code: 'fr', label: 'French',      native: 'Français',   flag: '🇫🇷' },
  { code: 'rw', label: 'Kinyarwanda', native: 'Kinyarwanda',flag: '🇷🇼' },
];

type Translations = Record<string, Record<Lang, string>>;

export const TRANSLATIONS: Translations = {
  // Navigation
  'nav.home':        { en: 'Home',         fr: 'Accueil',      rw: 'Ahabanza'   },
  'nav.products':    { en: 'Products',     fr: 'Produits',     rw: 'Ibicuruzwa'  },
  'nav.skinquiz':    { en: 'Skin Type Quiz', fr: 'Quiz de peau', rw: 'Ikizamini cy\'uruhu' },
  'nav.orders':      { en: 'Orders',       fr: 'Commandes',    rw: 'Amaporosi'   },
  'nav.wishlist':    { en: 'Wishlist',     fr: 'Liste de souhaits', rw: 'Ibyo nyuma' },
  // Auth
  'auth.login':        { en: 'Log in',       fr: 'Se connecter', rw: 'Injira'       },
  'auth.register':     { en: 'Register',     fr: "S'inscrire",   rw: 'Iyandikishe'  },
  'auth.logout':       { en: 'Log out',      fr: 'Se déconnecter', rw: 'Sohoka'     },
  'auth.welcome':      { en: 'Welcome back', fr: 'Bon retour',   rw: 'Murakaza neza'},
  'auth.email':        { en: 'Email address',fr: 'Adresse e-mail',rw: 'Imeyili'     },
  'auth.password':     { en: 'Password',     fr: 'Mot de passe', rw: 'Ijambo banga' },
  'auth.name':         { en: 'Full name',    fr: 'Nom complet',  rw: 'Amazina yose' },
  'auth.forgotPw':     { en: 'Forgot password?', fr: 'Mot de passe oublié?', rw: 'Wibagiwe ijambo banga?' },
  'auth.createAccount':{ en: 'Create account', fr: 'Créer un compte', rw: 'Fungura konti' },
  'auth.haveAccount':  { en: 'Already have an account?', fr: 'Déjà un compte?', rw: 'Usanganywe konti?' },
  'auth.newUser':      { en: 'New to Davina Beauty?', fr: 'Nouveau sur Davina Beauty?', rw: 'Mushya kuri Davina Beauty?' },
  // Product card
  'product.addToCart': { en: 'Add to Cart', fr: 'Ajouter au panier', rw: 'Shyira mu gitebo' },
  'product.addingToCart': { en: 'Adding…',  fr: 'Ajout en cours…',   rw: 'Shyiraho…'        },
  'product.added':     { en: 'Added!',      fr: 'Ajouté!',           rw: 'Byongeywe!'       },
  'product.outOfStock':{ en: 'Out of Stock',fr: 'Épuisé',            rw: 'Nta bubiko'       },
  'product.quickView': { en: 'Quick View',  fr: 'Aperçu rapide',     rw: 'Reba vuba'        },
  'product.new':       { en: 'New',         fr: 'Nouveau',           rw: 'Gishya'           },
  'product.lowStock':  { en: 'Low Stock',   fr: 'Stock faible',      rw: 'Ibisa bike'       },
  // Footer
  'footer.tagline':    { en: 'Premium beauty & cosmetics, crafted for you.', fr: 'Beauté & cosmétiques premium, conçus pour vous.', rw: 'Ibisabo n\'ibicanwa by\'inganzo, bíkorwe kuwe.' },
  'footer.rights':     { en: 'All rights reserved.', fr: 'Tous droits réservés.', rw: 'Uburenganzira bwose burarinzwe.' },
  'footer.follow':     { en: 'Follow us', fr: 'Suivez-nous', rw: 'Dukurikire' },
  // Cart / Checkout
  'cart.empty':        { en: 'Your cart is empty', fr: 'Votre panier est vide', rw: 'Igitebo cyawe kirimo ubusa' },
  'cart.total':        { en: 'Total',        fr: 'Total',         rw: 'Igiteranyo'  },
  // Orders
  'orders.title':      { en: 'My Orders',   fr: 'Mes commandes', rw: 'Amaporosi yanjye' },
  'orders.empty':      { en: 'No orders yet', fr: 'Pas encore de commandes', rw: 'Nta maporosi nawe' },
  'orders.reorder':    { en: 'Reorder',     fr: 'Recommander',   rw: 'Ongera utegure'   },
  'orders.return':     { en: 'Request Return', fr: 'Demander un retour', rw: 'Saba gusubiza' },
  'orders.track':      { en: 'Track Order', fr: 'Suivre commande', rw: 'Kurikirana porosi' },
};

const STORAGE_KEY = 'davina_lang';

@Injectable({ providedIn: 'root' })
export class LangService {
  private _current = new BehaviorSubject<Lang>(this.loadSaved());
  current$ = this._current.asObservable();

  get current(): Lang { return this._current.value; }
  get options(): LangOption[] { return LANGUAGES; }
  get currentOption(): LangOption { return LANGUAGES.find(l => l.code === this.current)!; }

  setLang(code: Lang): void {
    localStorage.setItem(STORAGE_KEY, code);
    this._current.next(code);
  }

  t(key: string): string {
    return TRANSLATIONS[key]?.[this.current] ?? TRANSLATIONS[key]?.['en'] ?? key;
  }

  private loadSaved(): Lang {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    return saved && LANGUAGES.some(l => l.code === saved) ? saved : 'en';
  }
}
