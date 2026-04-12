import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly siteName = 'Davina — Nature Distilled Skincare';
  private readonly siteUrl = 'http://localhost:4200';
  private readonly defaultImage = 'http://localhost:4200/assets/og-default.jpg';
  private readonly defaultDescription =
    'Premium natural skincare products by Davina. Discover personalized routines for every skin type.';

  constructor(private meta: Meta, private titleService: Title) {}

  /** Set page title and meta/OG tags */
  updateMeta(config: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
  }): void {
    const title = config.title
      ? `${config.title} | ${this.siteName}`
      : this.siteName;
    const description = config.description || this.defaultDescription;
    const image = config.image || this.defaultImage;
    const url = config.url || this.siteUrl;
    const type = config.type || 'website';

    this.titleService.setTitle(title);

    // Standard meta
    this.setTag('description', description);

    // Open Graph
    this.setTag('og:title', title);
    this.setTag('og:description', description);
    this.setTag('og:image', image);
    this.setTag('og:url', url);
    this.setTag('og:type', type);
    this.setTag('og:site_name', this.siteName);

    // Twitter Card
    this.setTag('twitter:card', 'summary_large_image');
    this.setTag('twitter:title', title);
    this.setTag('twitter:description', description);
    this.setTag('twitter:image', image);
  }

  /** Set a product-specific structured page */
  updateProductMeta(product: {
    name: string;
    description: string;
    image?: string;
    price: number;
    id: string;
  }): void {
    this.updateMeta({
      title: product.name,
      description: product.description?.substring(0, 160),
      image: product.image,
      url: `${this.siteUrl}/products/${product.id}`,
      type: 'product',
    });
    this.setTag('product:price:amount', String(product.price));
    this.setTag('product:price:currency', 'EUR');
  }

  private setTag(name: string, content: string): void {
    // OG and product tags use property, others use name
    const isProperty = name.startsWith('og:') || name.startsWith('product:') || name.startsWith('twitter:');
    const selector = isProperty ? `property='${name}'` : `name='${name}'`;
    const attr = isProperty ? 'property' : 'name';

    if (this.meta.getTag(selector)) {
      this.meta.updateTag({ [attr]: name, content });
    } else {
      this.meta.addTag({ [attr]: name, content });
    }
  }
}
