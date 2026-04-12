import mongoose, { Schema, Document, Model } from "mongoose";

export type SkinTyp = "oily" | "dry" | "combination" | "normal";
export type EffectType =
  | "Hydration"
  | "Anti-Acne"
  | "Soothing"
  | "Mattifying"
  | "Anti-Aging"
  | "Brightening"
  | "Long-Lasting"
  | "Volumizing"
  | "Nourishing"
  | "Refreshing";

export interface IProductItem extends Document {
  p_name: string;
  p_description?: string;
  skin_typ_target: SkinTyp;
  effect: EffectType;
  price: number;
  stock: number;
  image_url?: string;
  images: string[];
  ingredients: string[];
  category: string;
  variants: { label: string; sku: string; stock: number; price_modifier: number }[];
  average_rating: number;
  review_count: number;
  createdAt: Date;
}

const ProductItemSchema: Schema<IProductItem> = new Schema(
  {
    p_name: {
      type: String,
      required: true,
      maxlength: 300,
    },
    p_description: {
      type: String,
    },
    skin_typ_target: {
      type: String,
      enum: ["oily", "dry", "combination", "normal"],
      required: true,
    },
    effect: {
      type: String,
      enum: [
        "Hydration",
        "Anti-Acne",
        "Soothing",
        "Mattifying",
        "Anti-Aging",
        "Brightening",
        "Long-Lasting",
        "Volumizing",
        "Nourishing",
        "Refreshing",
      ],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    image_url: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: "general",
    },
    variants: [
      {
        label: { type: String },
        sku: { type: String },
        stock: { type: Number, default: 0 },
        price_modifier: { type: Number, default: 0 },
      },
    ],
    average_rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    review_count: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "productItems",
    versionKey: false,
  }
);

const ProductItem: Model<IProductItem> = mongoose.model<IProductItem>(
  "ProductItem",
  ProductItemSchema
);

export default ProductItem;
