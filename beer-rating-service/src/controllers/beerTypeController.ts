import { Request, Response } from "express";
import { BeerType } from "../models/beerType";

export const getBeerTypes = async (req: Request, res: Response) => {
    try {
        const beerTypes = await BeerType.find();
        res.json(beerTypes);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const addBeerType = async (req: Request, res: Response) => {
    const { name } = req.body;
    try {
        const beerType = new BeerType({ name });
        await beerType.save();
        res.status(201).json(beerType);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}

export const deleteBeerType = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedBeerType = await BeerType.findByIdAndDelete(id);
        res.status(200).json({ message: `Beer type ${deletedBeerType?.name} deleted` });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}