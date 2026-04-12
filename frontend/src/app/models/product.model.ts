export type SkinType = "oily" | "dry" | "combination" | "normal";
export type EffectType = "Hydration" | "Anti-Acne" | "Soothing" | "Mattifying" | "Anti-Aging" | "Brightening" | "Long-Lasting" | "Volumizing" | "Nourishing" | "Refreshing";

export interface ProductVariant {
  label: string;
  sku: string;
  stock: number;
  price_modifier: number;
}

export interface Product {
  _id: string;
  p_name: string;
  p_description?: string;
  price: number;
  stock: number;
  skin_typ_target: SkinType;
  effect: EffectType;
  image_url?: string;
  images: string[];
  ingredients: string[];
  category: string;
  variants: ProductVariant[];
  average_rating: number;
  review_count: number;
  createdAt?: Date;
}
