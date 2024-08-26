import { Request, Response } from "express";
import Beer, { BeerStyle } from "../models/beer";
import Rating from "../models/rating";
import { MongoError } from "mongodb";

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
      return res.status(404).json({ message: "Beer not found" });
    }

    // Fetch all ratings for the beer
    const ratings = await Rating.find({ beer: beer._id }).populate(
      "user",
      "username"
    );

    // Calculate the average rating
    const averageRating =
      ratings.reduce((acc, rating) => acc + rating.score, 0) / ratings.length;

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
    if (error instanceof MongoError && error.code === 11000) {
      res.status(400).json({ message: "Beer name must be unique." });
    } else if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to create beer", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};

export const getBeersByStyle = async (req: Request, res: Response) => {
  const { style } = req.params; // Extract beer style from URL parameters

  // Check if the provided style is a valid BeerStyle
  if (!Object.values(BeerStyle).includes(style as BeerStyle)) {
    const validStyles = Object.values(BeerStyle); // Get all valid beer styles
    return res.status(400).json({
      message: `Invalid beer style provided. Valid styles are: ${validStyles.join(
        ", "
      )}`,
      validStyles: validStyles, // Include the list of valid styles in the response
    });
  }

  try {
    // Find all beers that match the specified style
    const beers = await Beer.find({ type: style });

    if (beers.length === 0) {
      return res
        .status(404)
        .json({ message: `No beers found for style: ${style}` });
    }

    res.status(200).json(beers);
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to fetch beers", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};
