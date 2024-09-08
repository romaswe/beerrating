import mongoose, { Document, Schema, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { BeerType } from "./beerType";

export interface IBeer extends Document {
  name: string;
  type: string[];
  brewery?: string;
  abv?: number;
  averageRating?: number;
  reviews?: mongoose.Schema.Types.ObjectId[];
  tasting?: mongoose.Schema.Types.ObjectId[];
}

interface IBeerModel extends PaginateModel<IBeer> { }

const beerSchema = new Schema<IBeer>(
  {
    name: { type: String, required: true, index: true },
    type: {
      type: [String],
      required: true,
      validate: {
        validator: async function (value: string[]): Promise<boolean> {
          const validTypes = await BeerType.find({ name: { $in: value } }).select('name').exec();
          return validTypes.length === value.length;
        },
        message: 'One or more beer types are invalid.'
      }, index: true
    },
    brewery: {
      type: String,
      required: false,
    },
    abv: {
      type: Number,
      required: false,
      min: 0, max: 100
    },
    averageRating: { type: Number, default: 0, index: true }, // This will be computed from ratings
    tasting: [{ type: Schema.Types.ObjectId, ref: 'Tasting' }],
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Rating' }],
  },
  { timestamps: true }
);

beerSchema.plugin(mongoosePaginate);
const Beer = mongoose.model<IBeer, IBeerModel>("Beer", beerSchema);
export default Beer;
