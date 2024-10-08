import { Request, Response } from "express";
import Tasting from "../models/tasting";
import Beer from "../models/beer";
import mongoose from "mongoose";

// Create a new tasting with beer validation
export const createTasting = async (req: Request, res: Response) => {
    try {

        const { name, description, beers = [] } = req.body;

        const existingBeers = await Beer.find({ _id: { $in: beers } });
        if (existingBeers.length !== beers.length) {
            return res.status(400).json({ message: "Some beers do not exist" });
        }

        const newTasting = new Tasting({
            name,
            description,
            beers,
        });

        // Calculate the average rating of the beers in the tasting
        if (existingBeers.length > 0) {
            const totalBeerRating = existingBeers.reduce((total, beer) => total + (beer.averageRating || 0), 0);
            const averageBeerRating = totalBeerRating / existingBeers.length;
            newTasting.averageBeerRating = averageBeerRating;
        } else {
            newTasting.averageBeerRating = 0;
        }

        await newTasting.save();
        return res.status(201).json(newTasting);
    } catch (error) {
        return res.status(500).json({ message: "Error creating tasting", error });
    }
};

// Fetch all tastings with pagination
export const getTastings = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const nameQuery = req.query.q as string;
        // Build the filter query
        const filter: any = {};
        if (nameQuery) {
            const regex = new RegExp(nameQuery, "i"); // i for case insensitive
            filter.name = { $regex: regex };
        }
        const tastings = await Tasting.paginate(filter, { page: Number(page), limit: Number(limit) });
        return res.status(200).json(tastings);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching tastings", error });
    }
};

// Delete a tasting and remove it from beers
export const deleteTasting = async (req: Request, res: Response) => {
    const { tastingId } = req.params;

    try {
        const tasting = await Tasting.findByIdAndDelete(tastingId);
        if (!tasting) return res.status(404).json({ message: "Tasting not found" });

        // Remove the tasting from associated beers
        await Beer.updateMany({ tasting: tastingId }, { $pull: { tasting: tastingId } });

        return res.status(200).json({ message: "Tasting deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting tasting", error });
    }
};

// Add a beer to a tasting
export const addBeerToTasting = async (req: Request, res: Response) => {
    const { tastingId, beerId } = req.params;

    try {
        const tasting = await Tasting.findById(tastingId);
        if (!tasting) return res.status(404).json({ message: "Tasting not found" });

        const beer = await Beer.findById(beerId);
        if (!beer) return res.status(404).json({ message: "Beer not found" });

        // Add beer to tasting if not already there
        if (!tasting.beers?.includes(beer.id)) {
            tasting.beers?.push(beer.id);

            // Recalculate the average beer rating
            const allBeers = await Beer.find({ _id: { $in: tasting.beers } });
            const totalBeerRating = allBeers.reduce((total, beer) => total + (beer.averageRating || 0), 0);
            tasting.averageBeerRating = totalBeerRating / allBeers.length;

            await tasting.save();
        }

        return res.status(200).json(tasting);
    } catch (error) {
        return res.status(500).json({ message: "Error adding beer to tasting", error });
    }
};

// Add a rating with optional comment (one user can only rate once)
export const addRating = async (req: Request, res: Response) => {
    const { tastingId } = req.params;
    const { score, comment } = req.body;
    const userId = req.user?.id;

    try {
        const tasting = await Tasting.findById(tastingId);
        if (!tasting) {
            return res.status(404).json({ message: "Tasting not found" });
        }

        // Check if the user has already rated this tasting
        const existingRating = tasting.reviews?.find((review) => review.user?.toString() === userId);
        if (existingRating) {
            return res.status(400).json({ message: "User has already rated this tasting" });
        }

        // Add new rating with correct field name 'user' as per schema
        tasting.reviews?.push({ score, comment, user: userId });

        await tasting.save();
        return res.status(201).json(tasting);
    } catch (error) {
        return res.status(500).json({ message: "Error adding rating", error });
    }
};

// Update a tasting
export const updateTasting = async (req: Request, res: Response) => {
    const { tastingId } = req.params;
    const { name, description, beers } = req.body;

    try {
        // Optional: Validate the beers if they are updated
        if (beers) {
            const existingBeers = await Beer.find({ _id: { $in: beers } });
            if (existingBeers.length !== beers.length) {
                return res.status(400).json({ message: "Some beers do not exist" });
            }



            // Calculate the average rating of the beers in the tasting
            var averageBeerRating = 0
            if (existingBeers.length > 0) {
                const totalBeerRating = existingBeers.reduce((total, beer) => total + (beer.averageRating || 0), 0);
                averageBeerRating = totalBeerRating / existingBeers.length;
            }

            const updatedTasting = await Tasting.findByIdAndUpdate(
                tastingId,
                { name, description, beers, averageBeerRating },
                { new: true, runValidators: true }
            );

            if (!updatedTasting) {
                return res.status(404).json({ message: "Tasting not found" });
            }


            return res.status(200).json(updatedTasting);
        }
    } catch (error) {
        return res.status(500).json({ message: "Error updating tasting", error });
    }
};

// Remove a beer from a tasting
export const removeBeerFromTasting = async (req: Request, res: Response) => {
    const { tastingId, beerId } = req.params;

    try {
        const tasting = await Tasting.findById(tastingId);
        if (!tasting) return res.status(404).json({ message: "Tasting not found" });

        const beerIndex = tasting.beers?.indexOf(beerId as unknown as mongoose.Schema.Types.ObjectId);

        if (beerIndex !== -1 && beerIndex !== undefined) {
            tasting.beers?.splice(beerIndex, 1);

            // Recalculate the average beer rating after removing the beer
            const allBeers = await Beer.find({ _id: { $in: tasting.beers } });
            const totalBeerRating = allBeers.reduce((total, beer) => total + (beer.averageRating || 0), 0);
            tasting.averageBeerRating = allBeers.length > 0 ? totalBeerRating / allBeers.length : 0;

            await tasting.save();
        } else {
            return res.status(404).json({ message: "Beer not found in this tasting" });
        }

        return res.status(200).json(tasting);
    } catch (error) {
        return res.status(500).json({ message: "Error removing beer from tasting", error });
    }
};
