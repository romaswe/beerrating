import mongoose, { Document, Schema } from 'mongoose';

export interface IBeer extends Document {
    name: string;
    type: string;
    averageRating?: number; // Optional field for the beer's average rating
}

const beerSchema = new Schema<IBeer>({
    name: { type: String, required: true },
    type: { type: String, required: true },
    averageRating: { type: Number, default: 0 }, // This will be computed from ratings
}, { timestamps: true });

export default mongoose.model<IBeer>('Beer', beerSchema);
