export type SkinType = "fettig" | "trocken" | "misch" | "normal";
export type EffectType = "Hydratation" | "Anti-Akne" | "Beruhigend" | "Mattierend" | "Anti-Age";

export interface Product {
  _id: string;
  p_name: string;
  p_description?: string;
  price: number;
  skin_typ_target: SkinType;
  effect: EffectType;
  image_url?: string;
  createdAt?: Date;
}
