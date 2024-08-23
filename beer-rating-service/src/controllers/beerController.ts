import { Request, Response } from 'express';
import Beer from '../models/beer';
import { beerSchema } from '../validation/beerValidation';

export const getBeers = async (req: Request, res: Response) => {
    try {
        const beers = await Beer.find({ user: req.user?.id });
        res.json(beers);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createBeer = async (req: Request, res: Response) => {
    try {
        const beerInput = beerSchema.parse(req.body);

        const beer = new Beer({
            ...beerInput,
            user: req.user?.id,
        });

        const savedBeer = await beer.save();
        res.status(201).json(savedBeer);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Invalid data' });
        }
    }
};

export const updateBeer = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const beerInput = beerSchema.parse(req.body);

        const beer = await Beer.findById(id);

        if (!beer) {
            return res.status(404).json({ message: 'Beer not found' });
        }

        if (beer.user.toString() !== req.user?.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        beer.name = beerInput.name;
        beer.type = beerInput.type;
        beer.rating = beerInput.rating;

        const updatedBeer = await beer.save();
        res.json(updatedBeer);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ message: 'Invalid data' });
        }
    }
};

export const deleteBeer = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const beer = await Beer.findById(id);

        if (!beer) {
            return res.status(404).json({ message: 'Beer not found' });
        }

        if (beer.user.toString() !== req.user?.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Beer.deleteOne({ _id: id }); // Use deleteOne instead of remove
        res.json({ message: 'Beer removed' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
