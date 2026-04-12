import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGiftCard extends Document {
  code: string;
  initial_balance: number;
  current_balance: number;
  sender_email: string;
  recipient_email: string;
  recipient_name: string;
  message: string;
  is_active: boolean;
  expires_at: Date;
  createdAt: Date;
}

const GiftCardSchema: Schema<IGiftCard> = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    initial_balance: { type: Number, required: true, min: 1 },
    current_balance: { type: Number, required: true, min: 0 },
    sender_email: { type: String, required: true },
    recipient_email: { type: String, required: true },
    recipient_name: { type: String, default: "" },
    message: { type: String, default: "" },
    is_active: { type: Boolean, default: true },
    expires_at: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "giftcards", versionKey: false }
);

const GiftCard: Model<IGiftCard> = mongoose.model<IGiftCard>("GiftCard", GiftCardSchema);
export default GiftCard;
