import mongoose, { Document, Schema } from 'mongoose';


const defaultBeerTypes = [
    { name: 'IPA' },
    { name: 'Lager' },
    { name: 'Stout' },
    { name: 'Pilsner' },
    { name: 'Ale' },
    { name: 'Porter' },
    { name: 'Wheat' },
    { name: 'Saison' },
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


export interface IBeerType extends Document {
    name: string;
}

const BeerTypeSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true }
});

export const BeerType = mongoose.model<IBeerType>('BeerType', BeerTypeSchema);
