import { Request, Response } from "express";
import Beer from "../models/beer";
import Rating from "../models/rating";
import { MongoError } from "mongodb";
import { BeerType } from "../models/beerType";

// Fetch beers with pagination, filtering, and sorting
export const getBeers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not specified
    const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page if not specified

    // Get the 'styles' query parameter and convert it into an array
    const stylesQuery = req.query.styles as string; // Expecting a comma-separated list of styles
    const styles = stylesQuery ? stylesQuery.split(",") : [];

    // Get the 'breweries' query parameter and convert it into an array
    const breweryQuery = req.query.breweries as string; // Expecting a comma-separated list of breweries
    const breweries = breweryQuery ? breweryQuery.split(",") : [];

    // Fetch the valid beer types from the BeerType model
    const validBeerTypes = await BeerType.find({ name: { $in: styles } }).select('name').exec();

    // Extract only the names from the validBeerTypes array
    const validTypes = validBeerTypes.map(beerType => beerType.name);

    // Get the ABV range query parameters
    const abvMin = parseFloat(req.query.abvMin as string) || 0;
    const abvMax = parseFloat(req.query.abvMax as string) || 100;

    const nameQuery = req.query.q as string;

    // Get the 'sortOrder' query parameter, or default to sorting by average rating in descending order
    // Sort by ABV in ascending order: ?sortField=abv&sortOrder=1
    // Sort by beer name in descending order: ?sortField=name&sortOrder=-1
    const sortField = req.query.sortField as string || 'averageRating';
    const sortOrder = parseInt(req.query.sortOrder as string) || -1;

    // Build the filter query
    const filter: any = {};

    if (validTypes.length > 0) {
      filter.type = { $in: validTypes }; // Filter by beer styles if provided
    }

    if (breweries.length > 0) {
      filter.brewery = { $in: breweries }; // Filter by breweries if provided
    }

    if (nameQuery) {
      const regex = new RegExp(nameQuery, "i"); // i for case insensitive
      filter.name = { $regex: regex };
    }

    // Filter by ABV range
    filter.abv = { $gte: abvMin, $lte: abvMax };

    console.log("hj");
    console.log(sortField);
    console.log(sortOrder);



    // Use mongoose-paginate-v2 to fetch beers with pagination, filtering, and dynamic sorting
    const beers = await Beer.paginate(filter, {
      page,
      limit,
      sort: { [sortField]: sortOrder }, // Dynamic sorting based on the provided field and order
      populate: [
        { path: 'tasting', model: 'Tasting' },
        {
          path: 'reviews',
          model: 'Rating',
          populate: {
            path: 'user', // Populate the user field within reviews
            model: 'User',
            select: 'username role', // Specify which fields to return
            match: { deletedAt: null, _id: { $ne: null } }, // Exclude deleted users
          },
        },
      ],
    });

    // Fetch all valid beer types to return in the response
    const allValidBeerTypes = await BeerType.find().select('name').sort({ name: 1 }).lean();
    const allValidTypes = allValidBeerTypes.map(beerType => beerType.name);

    // Fetch all unique breweries and return them in the response
    const allBreweries = (await Beer.distinct('brewery', { brewery: { $ne: "" } })).sort((a, b) => a.localeCompare(b));

    res.json({ ...beers, validBeerTypes: allValidTypes, allBreweries });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};





// Fetch a specific beer along with all ratings and average rating

export const getBeerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Populate rating and tasting
    const beer = await Beer.findById(id)
      .populate({ path: 'reviews', model: 'Rating' })
      .populate({
        path: 'reviews',
        model: 'Rating',
        populate: {
          path: 'user', // Populate the user field within reviews
          model: 'User',
          select: 'username role', // Specify which fields to return
        },
      });

    if (!beer) {
      return res.status(404).json({ message: "Beer not found" });
    }

    res.json({ beer });
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
    // Get the 'styles' query parameter and convert it into an array
    const stylesQuery = req.query.styles as string; // Expecting a comma-separated list of styles
    const styles = stylesQuery ? stylesQuery.split(",") : [];
    // Fetch the valid beer types from the BeerType model
    const validBeerTypes = await BeerType.find({ name: { $in: styles } }).select('name').exec();

    if (!validBeerTypes.length) {
      return res.status(404).json({ message: `No valid beer types found for styles: ${styles}` });
    }

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
