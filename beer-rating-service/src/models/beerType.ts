import mongoose, { Document, PaginateModel, Schema } from 'mongoose';
import mongoosePaginate from "mongoose-paginate-v2";

const defaultBeerTypes = [
    { name: 'IPA' },
    { name: 'Lager' },
    { name: 'Stout' },
    { name: 'Pilsner' },
    { name: 'Ale' },
    { name: 'Porter' },
    { name: 'Wheat' },
    { name: 'Saison' },
    { name: 'Sour' },
    { name: 'Hazy' },
    { name: 'APA' },
    { name: 'Cider' },
    { name: 'Festbier' },
    { name: 'Other' }
];

export const seedBeerTypes = async () => {
    try {
        const count = await BeerType.countDocuments();
        if (count === 0) {
            await BeerType.insertMany(defaultBeerTypes);
            console.log('Default beer types seeded successfully.');
        } else {
            console.log('Beer types already exist, skipping seeding.');
        }
    } catch (error) {
        console.error('Error seeding beer types:', error);
    }
};

interface IBeerTypeModel extends PaginateModel<IBeerType> { }
export interface IBeerType extends Document {
    name: string;
}

const BeerTypeSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true, index: true }
});
BeerTypeSchema.plugin(mongoosePaginate);
export const BeerType = mongoose.model<IBeerType, IBeerTypeModel>('BeerType', BeerTypeSchema);
