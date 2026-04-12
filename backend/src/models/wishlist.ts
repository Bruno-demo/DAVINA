import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWishlistItem {
  product_id: mongoose.Types.ObjectId;
  added_at: Date;
}

export interface IWishlist extends Document {
  user_id: number;
  items: IWishlistItem[];
}

const WishlistItemSchema = new Schema<IWishlistItem>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "ProductItem",
      required: true,
    },
    added_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const WishlistSchema = new Schema<IWishlist>(
  {
    user_id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [WishlistItemSchema],
      default: [],
    },
  },
  {
    collection: "wishlists",
    timestamps: true,
  }
);

const Wishlist: Model<IWishlist> = mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
