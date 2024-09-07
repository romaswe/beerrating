import mongoose, { Document, Schema } from "mongoose";

export interface IRating extends Document {
  beer: mongoose.Schema.Types.ObjectId; // Reference to the Beer model
  user: mongoose.Schema.Types.ObjectId; // Reference to the User model
  score: number;
  comment?: string; // Optional comment field
}

const ratingSchema = new Schema<IRating>(
  {
    beer: { type: mongoose.Schema.Types.ObjectId, ref: "Beer", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IRating>("Rating", ratingSchema);
