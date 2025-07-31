import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SkinType = "fettig" | "trocken" | "misch" | "normal";

export interface ISkinAnalysis extends Document {
  userId: number;
  imageUrl?: string;
  diagnostic: string;
  skin_typ_target: SkinType;
  recommendedProducts: Types.ObjectId[];
  createdAt: Date;
}

const SkinAnalysisSchema: Schema<ISkinAnalysis> = new Schema({
  userId: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
  diagnostic: {
    type: String,
    required: true,
  },
  skin_typ_target: {
    type: String,
    enum: ["fettig", "trocken", "misch", "normal"],
    required: true,
  },
  recommendedProducts: [
    {
      type: Schema.Types.ObjectId,
      ref: "ProductItem",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SkinAnalysis: Model<ISkinAnalysis> = mongoose.model<ISkinAnalysis>(
  "SkinAnalysis",
  SkinAnalysisSchema
);

export default SkinAnalysis;
