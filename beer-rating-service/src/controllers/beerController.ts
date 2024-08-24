import { Request, Response } from 'express';
import Beer from '../models/beer';
import Rating from '../models/rating';

// Fetch all beers without ratings
export const getBeers = async (req: Request, res: Response) => {
    try {
        const beers = await Beer.find();
        res.json(beers);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// Fetch a specific beer along with all ratings and average rating
export const getBeerWithRatings = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const beer = await Beer.findById(id);
        if (!beer) {
            return res.status(404).json({ message: 'Beer not found' });
        }

        // Fetch all ratings for the beer
        const ratings = await Rating.find({ beer: beer._id }).populate('user', 'username');

        // Calculate the average rating
        const averageRating = ratings.reduce((acc, rating) => acc + rating.score, 0) / ratings.length;

        res.json({ beer, ratings, averageRating });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// Add a new beer
export const createBeer = async (req: Request, res: Response) => {
    const { name, type } = req.body;

    try {
        const beer = new Beer({ name, type });
        const savedBeer = await beer.save();
        res.status(201).json(savedBeer);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};
