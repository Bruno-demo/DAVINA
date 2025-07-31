import mongoose, { Schema, Document, Model } from "mongoose";

export type SkinTyp = "fettig" | "trocken" | "misch" | "normal";
export type EffectType =
  | "Hydratation"
  | "Anti-Akne"
  | "Beruhigend"
  | "Mattierend"
  | "Anti-Age";

export interface IProductItem extends Document {
  p_name: string;
  p_description?: string;
  skin_typ_target: SkinTyp;
  effect: EffectType;
  price: number;
  image_url?: string;
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
      enum: ["fettig", "trocken", "misch", "normal"],
      required: true,
    },
    effect: {
      type: String,
      enum: [
        "Hydratation",
        "Anti-Akne",
        "Beruhigend",
        "Mattierend",
        "Anti-Age",
      ],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image_url: {
      type: String,
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
