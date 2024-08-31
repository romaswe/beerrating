import mongoose, { Document, Schema, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

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
  OTHER = "Other",
}

export interface IBeer extends Document {
  name: string;
  type: BeerStyle[];  // Update to array of BeerStyle
  brewery?: string;
  abv?: number;
  averageRating?: number;
}

interface IBeerModel extends PaginateModel<IBeer> { }

const beerSchema = new Schema<IBeer>(
  {
    name: { type: String, required: true, unique: true },
    type: {
      type: [String], // Change to array of strings
      enum: Object.values(BeerStyle), // Validate each value against the BeerStyle enum
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

beerSchema.plugin(mongoosePaginate);
const Beer = mongoose.model<IBeer, IBeerModel>("Beer", beerSchema);
export default Beer;
