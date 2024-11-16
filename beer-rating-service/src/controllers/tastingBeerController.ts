import { Request, Response } from "express";
import TastingBeer from "../models/tastingBeer";
import { MongoError } from "mongodb";
import { BeerType } from "../models/beerType";

export const addTastingBeer = async (req: Request, res: Response) => {
    const { name, type, link, comment } = req.body;
    try {
        const tastingBeer = new TastingBeer({ name, type, link, comment });
        await tastingBeer.save();
        res.status(201).json(tastingBeer);
    } catch (error) {
        if (error instanceof MongoError && error.code === 11000) {
            res.status(400).json({ message: "Beer name must be unique." });
        } else if (error instanceof Error) {
            res.status(500).json({ message: `Failed to create beer`, error: error.message });
        } else {
            res.status(500).json({ message: "An unexpected error occurred." });
        }
    }
};

export const getTastingBeers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not specified
        const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page if not specified

        const nameQuery = req.query.q as string;
        const filter: any = {};
        if (nameQuery) {
            const regex = new RegExp(nameQuery, "i"); // i for case insensitive
            filter.name = { $regex: regex };
        }

        // Fetch all valid beer types to return in the response
        const allValidBeerTypes = await BeerType.find().select('name').sort({ name: 1 }).lean();
        const allValidTypes = allValidBeerTypes.map(beerType => beerType.name);

        const tastingBeers = await TastingBeer.paginate(filter, { page, limit });
        res.status(200).json({ ...tastingBeers, allValidTypes });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getTastingBeerById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const trendingBeer = await TastingBeer.findById(id);
        if (!trendingBeer) {
            return res.status(404).json({ message: "Tasting beer not found" });
        }
        res.status(200).json(trendingBeer);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateTastingBeer = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, type, link, comment } = req.body;
    try {
        const tastingBeer = await TastingBeer.findByIdAndUpdate(id, { name, type, link, comment }, { new: true });
        if (!tastingBeer) {
            return res.status(404).json({ message: "Tasting beer not found" });
        }
        res.status(200).json(tastingBeer);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deleteTastingBeer = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedTastingBeer = await TastingBeer.findByIdAndDelete(id);
        res.status(200).json({ message: `Tasting beer ${deletedTastingBeer?.name} deleted` });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};