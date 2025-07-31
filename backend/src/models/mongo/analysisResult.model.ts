import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnalysisResult extends Document {
  userId: mongoose.Types.ObjectId;
  akne: boolean;
  roetung: boolean;
  fleck: boolean;
  date_diagnostic: Date;
}

const AnalysisResultSchema: Schema<IAnalysisResult> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  akne: {
    type: Boolean,
    default: false,
  },
  roetung: {
    type: Boolean,
    default: false,
  },
  fleck: {
    type: Boolean,
    default: false,
  },
  date_diagnostic: {
    type: Date,
    default: Date.now,
  },
});

const AnalysisResult: Model<IAnalysisResult> = mongoose.model<IAnalysisResult>(
  "AnalysisResult",
  AnalysisResultSchema
);

export default AnalysisResult;
