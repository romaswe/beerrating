import { Request, Response } from "express";
import Beer, { BeerStyle } from "../models/beer";
import Rating from "../models/rating";
import { MongoError } from "mongodb";

export const getBeers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page if not specified

    // Get the 'styles' query parameter and convert it into an array
    const stylesQuery = req.query.styles as string; // Expecting a comma-separated list of styles
    const styles = stylesQuery ? stylesQuery.split(",") : [];

    const nameQuery = req.query.q as string;

    // Build the filter query
    const filter: any = {};

    if (styles.length > 0) {
      filter.type = { $in: styles }; // Filter by beer styles if provided
    }

    if (nameQuery) {
      const regex = new RegExp(nameQuery, "i"); // i for case insensitive
      filter.name = { $regex: regex };
    }
    // Use mongoose-paginate-v2 to fetch beers with pagination, filtering, and sorting by average rating
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
  const { name, type } = req.body;

  try {
    const beer = new Beer({ name, type });
    const savedBeer = await beer.save();
    res.status(201).json(savedBeer);
  } catch (error) {
    if (error instanceof MongoError && error.code === 11000) {
      res.status(400).json({ message: "Beer name must be unique." });
    } else if (error instanceof Error) {
      const validStyles = Object.values(BeerStyle);
      res
        .status(500)
        .json({
          message: `Failed to create beer make sure you are using a valid style. Valid styles are: ${validStyles.join(", ")}`,
          error: error.message,
        });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};

export const getBeersByStyle = async (req: Request, res: Response) => {
  const { style } = req.params; // Extract beer style from URL parameters
  const page = parseInt(req.query.page as string, 10) || 1; // Default to 1 if page query param is not provided
  const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 if limit query param is not provided

  // Check if the provided style is a valid BeerStyle
  if (!Object.values(BeerStyle).includes(style as BeerStyle)) {
    const validStyles = Object.values(BeerStyle); // Get all valid beer styles
    return res.status(400).json({
      message: `Invalid beer style provided. Valid styles are: ${validStyles.join(
        ", ",
      )}`,
      validStyles: validStyles, // Include the list of valid styles in the response
    });
  }

  try {
    // Find all beers that match the specified style
    const beers = await Beer.paginate({ style }, { page, limit });

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

export const updateBeer = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type, brewery, abv } = req.body;

  if (type && !Object.values(BeerStyle).includes(type)) {
    const validStyles = Object.values(BeerStyle);
    return res.status(400).json({
      message: `Invalid beer style provided. Valid styles are: ${validStyles.join(", ")}`,
      validStyles: validStyles,
    });
  }

  try {
    const beer = await Beer.findByIdAndUpdate(
      id,
      { name, type, brewery, abv },
      { new: true, runValidators: true },
    );

    if (!beer) {
      return res.status(404).json({ message: `Beer with ID ${id} not found.` });
    }

    res.status(200).json(beer);
  } catch (error) {
    if (error instanceof MongoError && error.code === 11000) {
      res.status(400).json({ message: "Beer name must be unique." });
    } else if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to update beer", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};

export const deleteBeer = async (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Delete ratings for the beer
  try {
    const beer = await Beer.findByIdAndDelete(id);

    if (!beer) {
      return res.status(404).json({ message: `Beer with ID ${id} not found.` });
    }

    res.status(200).json({ message: `Beer with ID ${id} has been deleted.` });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to delete beer", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};
