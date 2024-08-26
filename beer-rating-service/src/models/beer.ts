import mongoose, { Document, Schema } from "mongoose";

export enum BeerStyle {
  LAGER = "Lager",
  PILSNER = "Pilsner",
  PALE_ALE = "Pale Ale",
  IPA = "IPA",
  STOUT = "Stout",
  PORTER = "Porter",
  WHEAT = "Wheat",
  SOUR = "Sour",
  SAISON = "Saison",
  BELGIAN_ALE = "Belgian Ale",
  DOUBLE_IPA = "Double IPA",
  AMBER_ALE = "Amber Ale",
  BROWN_ALE = "Brown Ale",
  DUNKEL = "Dunkel",
}

export interface IBeer extends Document {
  name: string;
  type: BeerStyle;
  brewery?: string;
  abv?: number;
  averageRating?: number;
}

const beerSchema = new Schema<IBeer>(
  {
    name: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: Object.values(BeerStyle), // Validate against the BeerStyle enum
      required: true,
    },
    brewery: {
      type: String,
      required: false,
    },
    abv: {
      type: Number,
      required: false,
    },
    averageRating: { type: Number, default: 0 }, // This will be computed from ratings
  },
  { timestamps: true }
);

export default mongoose.model<IBeer>("Beer", beerSchema);
