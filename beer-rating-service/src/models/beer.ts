import mongoose, { Document, Schema } from 'mongoose';

interface IBeer extends Document {
    name: string;
    type: string;
    rating: number;
    user: mongoose.Schema.Types.ObjectId;
}

const beerSchema = new Schema<IBeer>({
    name: { type: String, required: true },
    type: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IBeer>('Beer', beerSchema);
