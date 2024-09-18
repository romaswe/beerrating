// Tasting model for beer tastings

import mongoose, { Document, Schema, PaginateModel } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";


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
    avrageRating?: number;
}

interface ITastingModel extends PaginateModel<ITasting> { }

const tastingSchema = new Schema<ITasting>(
    {
        name: { type: String, required: true, unique: true, index: true },
        description: { type: String },
        beers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Beer" }],
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        reviews: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            score: { type: Number, required: true, min: 0, max: 5 },
            comment: { type: String },
        }],
    },
    { timestamps: true }
);

tastingSchema.plugin(mongoosePaginate);
const Tasting = mongoose.model<ITasting, ITastingModel>("Tasting", tastingSchema);
export default Tasting;