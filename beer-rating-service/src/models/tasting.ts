// Tasting model for beer tastings

import mongoose, { Document, Schema, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Beer from "./beer";


export interface Reviews {
    user: mongoose.Schema.Types.ObjectId;
    score: number; // Score how good the testing was
    comment?: string;
}
export interface ITasting extends Document {
    name: string;
    description?: string;
    beers?: mongoose.Schema.Types.ObjectId[];
    users?: mongoose.Schema.Types.ObjectId[]; // Users should be able to check-in that they have tried the tasting
    reviews?: Reviews[];
    averageBeerRating?: number;
}

interface ITastingModel extends PaginateModel<ITasting> { }

const tastingSchema = new Schema<ITasting>(
    {
        name: { type: String, required: true, unique: true, index: true },
        description: { type: String },
        beers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Beer", index: true }],
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        reviews: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            score: { type: Number, required: true, min: 0, max: 5 },
            comment: { type: String },
        }],
        averageBeerRating: { type: Number, default: 0, index: true }
    },
    { timestamps: true }
);

tastingSchema.plugin(mongoosePaginate);

// Recalculate averageBeerRating for a specific tasting
tastingSchema.methods.recalculateAverageBeerRating = async function () {
    const tasting = this;

    // Fetch all beers in this tasting
    const beers = await Beer.find({ _id: { $in: tasting.beers } });

    if (beers.length === 0) {
        tasting.averageBeerRating = 0;
        return await tasting.save();
    }

    // Calculate the average rating of all beers in the tasting
    const totalRating = beers.reduce((acc, beer) => acc + (beer.averageRating || 0), 0);
    tasting.averageBeerRating = totalRating / beers.length;

    return await tasting.save();
};

const Tasting = mongoose.model<ITasting, ITastingModel>("Tasting", tastingSchema);
export default Tasting;