import { Request, Response } from "express";
import Beer from "../models/beer";
import Rating from "../models/rating";
import { MongoError } from "mongodb";
import { BeerType } from "../models/beerType";

// Utility function to convert a string to a BeerStyle enum, if possible


// Fetch beers with pagination, filtering, and sorting
export const getBeers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page if not specified

    // Get the 'styles' query parameter and convert it into an array
    const stylesQuery = req.query.styles as string; // Expecting a comma-separated list of styles
    const styles = stylesQuery ? stylesQuery.split(",") : [];
    // Fetch the valid beer types from the BeerType model
    const validBeerTypes = await BeerType.find({ name: { $in: styles } }).select('name').exec();

    // Extract only the names from the validBeerTypes array
    const validTypes = validBeerTypes.map(beerType => beerType.name);

    const nameQuery = req.query.q as string;

    // Build the filter query
    const filter: any = {};

    if (validTypes.length > 0) {
      filter.type = { $in: validTypes }; // Filter by beer styles if provided
    }

    if (nameQuery) {
      const regex = new RegExp(nameQuery, "i"); // i for case insensitive
      filter.name = { $regex: regex };
    }

    // Use mongoose-paginate-v2 to fetch beers with pagination, filtering, and sorting by average rating
    // TODO: Populate reviews and tasting
    const beers = await Beer.paginate(filter, {
      page,
      limit,
      sort: { averageRating: -1 }, // Sort by averageRating in descending order
    });

    res.json(beers);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Fetch a specific beer along with all ratings and average rating
// TODO: denna borde inte behövas, då vi får allt, men om man vill hämta 1 öl så borde vi tabort averageRating för det är redan i öl objektet. samt populate rating.
export const getBeerWithRatings = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const beer = await Beer.findById(id);
    if (!beer) {
      return res.status(404).json({ message: "Beer not found" });
    }

    // Fetch all ratings for the beer
    const ratings = await Rating.find({
      beer: beer._id,
    })
      .populate("user", "username")
      .sort({ updatedAt: -1 });

    // Calculate the average rating rounded to two decimal places
    const averageRating = ratings.length
      ? Math.round(
        (ratings.reduce((acc, rating) => acc + rating.score, 0) /
          ratings.length) *
        100,
      ) / 100
      : 0;

    res.json({ beer, ratings, averageRating });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Add a new beer
export const createBeer = async (req: Request, res: Response) => {
  const { name, type, brewery, abv } = req.body;

  try {
    // Convert all provided types to BeerStyle enums
    //const types: BeerStyle[] = type.map((style: string) => convertToBeerStyleEnum(style)).filter((style: null) => style !== null) as BeerStyle[];

    // Validate if all provided types are valid BeerStyles
    if (!type.length) {
      return res.status(400).json({
        message: `Invalid beer styles provided.`
      });
    }

    const beer = new Beer({ name, type: type, brewery, abv });
    const savedBeer = await beer.save();
    res.status(201).json(savedBeer);
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

// Fetch beers by style with pagination
export const getBeersByStyle = async (req: Request, res: Response) => {
  const { style } = req.params; // Extract beer style from URL parameters
  const page = parseInt(req.query.page as string, 10) || 1; // Default to 1 if page query param is not provided
  const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 if limit query param is not provided

  try {
    // Find all beers that include the specified style in their 'type' array
    const beers = await Beer.paginate({ type: style }, { page, limit });

    if (beers.docs.length === 0) {
      return res.status(404).json({ message: `No beers found for style: ${style}` });
    }

    res.status(200).json(beers);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Failed to fetch beers", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};
// Update an existing beer
export const updateBeer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type, brewery, abv } = req.body;

  try {
    const beer = await Beer.findByIdAndUpdate(
      id,
      { name, type: type, brewery, abv },
      { new: true, runValidators: true }
    );

    if (!beer) {
      return res.status(404).json({ message: `Beer with ID ${id} not found.` });
    }

    res.status(200).json(beer);
  } catch (error) {
    if (error instanceof MongoError && error.code === 11000) {
      res.status(400).json({ message: "Beer name must be unique." });
    } else if (error instanceof Error) {
      res.status(500).json({ message: "Failed to update beer", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};

// Delete a beer and its associated ratings
export const deleteBeer = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Find and delete the beer
    const beer = await Beer.findByIdAndDelete(id);

    if (!beer) {
      return res.status(404).json({ message: `Beer with ID ${id} not found.` });
    }

    // Delete all ratings associated with the beer
    await Rating.deleteMany({ beer: id });

    res.status(200).json({ message: `Beer with ID ${id} and its ratings have been deleted.` });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: "Failed to delete beer", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};
