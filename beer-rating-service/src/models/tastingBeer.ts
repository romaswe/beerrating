import mongoose, { Document, Schema, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { BeerType } from "./beerType";

export interface ITastingBeer extends Document {
    name: string;
    type: string[];
    link: string;
    comment?: string;
}

interface ITastingBeerModel extends PaginateModel<ITastingBeer> { }

const tastingBeerSchema = new Schema<ITastingBeer>(
    {
        name: { type: String, required: true, index: true, unique: true },
        type: {
            type: [String],
            required: true,
            unique: true,
            validate: {
                validator: async function (value: string[]): Promise<boolean> {
                    const validTypes = await BeerType.find({ name: { $in: value } }).select('name').exec();
                    return validTypes.length === value.length;
                },
                message: 'One or more beer types are invalid.'
            }, index: true
        },
        link: { type: String, required: true },
        comment: { type: String },
    },
    { timestamps: true }
);

tastingBeerSchema.plugin(mongoosePaginate);


const TastingBeer = mongoose.model<ITastingBeer, ITastingBeerModel>("TastingBeer", tastingBeerSchema);
export default TastingBeer;
