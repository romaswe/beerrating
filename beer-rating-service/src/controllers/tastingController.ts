import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tasting from '../models/tasting';

// Fetch all tastings with pagination
export const getTastings = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const options = {
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            populate: ['BeerV2', 'users'], // Populate related beers and users
            sort: { avrageRating: -1 }, // Sort by avrageRating (most recent first)
        };

        const tastings = await Tasting.paginate({}, options);
        res.status(200).json(tastings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tastings' });
    }
};

// Fetch a single tasting by ID
export const getTastingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Tasting ID' });
        }

        const tasting = await Tasting.findById(id).populate(['BeerV2', 'users']);
        if (!tasting) {
            return res.status(404).json({ error: 'Tasting not found' });
        }

        res.status(200).json(tasting);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tasting' });
    }
};

// Create a new tasting
export const createTasting = async (req: Request, res: Response) => {
    try {
        const { name, description, beers, users, reviews } = req.body;

        const newTasting = new Tasting({
            name,
            description,
            beers,
            users,
            reviews,
        });

        const savedTasting = await newTasting.save();
        res.status(201).json(savedTasting);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create tasting' });
    }
};

// Update an existing tasting by ID
export const updateTasting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Tasting ID' });
        }

        const tasting = await Tasting.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true, lean: true }
        );

        if (!tasting) {
            return res.status(404).json({ error: 'Tasting not found' });
        }

        res.status(200).json(tasting);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update tasting' });
    }
};

/*
export const updateTasting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Tasting ID' });
        }

        const updatedTasting = await Tasting.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        }).populate(['BeerV2', 'users']);

        if (!updatedTasting) {
            return res.status(404).json({ error: 'Tasting not found' });
        }

        res.status(200).json(updatedTasting);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update tasting' });
    }
};
*/

// Delete a tasting by ID
export const deleteTasting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Tasting ID' });
        }

        const deletedTasting = await Tasting.findByIdAndDelete(id);

        if (!deletedTasting) {
            return res.status(404).json({ error: 'Tasting not found' });
        }

        res.status(200).json({ message: `Tasting '${deletedTasting.name}' deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete tasting' });
    }
};
