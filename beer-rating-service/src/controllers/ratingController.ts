import { Request, Response } from "express";
import Beer from "../models/beer";
import Rating from "../models/rating";
import { isValidObjectId } from "mongoose";

// Add a new rating to a beer by a user
export const addRating = async (req: Request, res: Response) => {
  const { beerId, score, comment } = req.body;

  try {
    const beer = await Beer.findById(beerId);
    if (!beer) {
      return res.status(404).json({ message: "Beer not found" });
    }

    // Check if the user has already rated this beer
    const existingRating = await Rating.findOne({
      beer: beerId,
      user: req.user?.id,
    });
    if (existingRating) {
      return res
        .status(400)
        .json({ message: "You have already rated this beer." });
    }

    // Create a new rating
    const rating = new Rating({
      beer: beerId,
      user: req.user?.id,
      score,
      comment,
    });

    const savedRating = await rating.save();

    // Recalculate the average rating
    const allRatings = await Rating.find({ beer: beerId });

    // Calculate the average rating rounded to two decimal places
    const averageRating = allRatings.length
      ? Math.round(
        (allRatings.reduce((acc, rating) => acc + rating.score, 0) /
          allRatings.length) *
        100,
      ) / 100
      : 0;
    // Update the beer's average rating
    beer.averageRating = averageRating;
    if (!beer.reviews) {
      beer.reviews = []; // Initialize the reviews array if it's undefined
    }
    beer.reviews.push(savedRating.id);
    await beer.save();

    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const addBatchRatings = async (req: Request, res: Response) => {
  const ratings = req.body.ratings; // Array of { beerId, score, comment }

  if (!Array.isArray(ratings) || ratings.length === 0) {
    return res.status(400).json({ message: "Invalid request body. Please provide an array of ratings." });
  }

  try {
    const processedRatings = [];

    for (const { beerId, score, comment } of ratings) {
      const beer = await Beer.findById(beerId);
      if (!beer) continue; // Skip this beer if not found

      const existingRating = await Rating.findOne({
        beer: beerId,
        user: req.user?.id,
      });
      if (existingRating) continue; // Skip if already rated

      // Create and save a new rating
      const rating = new Rating({
        beer: beerId,
        user: req.user?.id,
        score,
        comment,
      });
      const savedRating = await rating.save();
      processedRatings.push(savedRating);

      // Add the rating ID to the beer's reviews
      if (!beer.reviews) beer.reviews = [];
      beer.reviews.push(savedRating.id);

      // Recalculate the average rating in this same loop
      const allRatings = await Rating.find({ beer: beerId });
      const averageRating = allRatings.length
        ? Math.round(
          (allRatings.reduce((acc, rating) => acc + rating.score, 0) /
            allRatings.length) *
          100
        ) / 100
        : 0;

      // Update the beer's average rating
      beer.averageRating = averageRating;
      await beer.save();
    }

    res.status(201).json({
      message: `${processedRatings.length} ratings added successfully.`,
      ratings: processedRatings,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};


export const updateRating = async (req: Request, res: Response) => {
  const { ratingId } = req.params;
  const { score, comment } = req.body;
  const userId = req.user?.id; // Assuming user ID is stored in req.user after authentication

  // Validate Object IDs
  if (!isValidObjectId(ratingId)) {
    return res.status(400).json({ message: "Invalid rating ID." });
  }

  try {
    // Find the rating by ratingId and userId
    const rating = await Rating.findOne({
      _id: ratingId,
      user: userId,
    });

    if (!rating) {
      return res.status(404).json({
        message: "Rating not found or not authorized to edit.",
      });
    }

    const beer = await Beer.findById(rating.beer);
    if (!beer) {
      return res.status(404).json({ message: "Beer not found" });
    }

    // Update the rating
    rating.score = score;
    rating.comment = comment;

    // Save the updated rating
    await rating.save();

    // Recalculate the average rating
    const allRatings = await Rating.find({ beer: rating.beer });

    // Calculate the average rating rounded to two decimal places
    const averageRating = allRatings.length
      ? Math.round(
        (allRatings.reduce((acc, rating) => acc + rating.score, 0) /
          allRatings.length) *
        100,
      ) / 100
      : 0;
    // Update the beer's average rating
    beer.averageRating = averageRating;
    await beer.save();

    res.status(200).json(rating);
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to update rating", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};

export const deleteRating = async (req: Request, res: Response) => {
  const { ratingId } = req.params;
  const userId = req.user?.id; // Assuming user ID is stored in req.user after authentication

  // Validate Object IDs
  if (!isValidObjectId(ratingId)) {
    return res.status(400).json({ message: "Invalid rating ID." });
  }

  try {
    // Find and delete the rating by ratingId and userId
    const rating = await Rating.findOneAndDelete({
      _id: ratingId,
      user: userId, // Ensure the rating belongs to the authenticated user
    });

    if (!rating) {
      return res.status(404).json({
        message: "Rating not found or not authorized to delete.",
      });
    }

    // Recalculate the average rating for the deleted rating's beer
    const allRatings = await Rating.find({ beer: rating.beer });

    // Calculate the average rating rounded to two decimal places
    const averageRating = allRatings.length
      ? Math.round(
        (allRatings.reduce((acc, rating) => acc + rating.score, 0) /
          allRatings.length) *
        100,
      ) / 100
      : 0;
    // Update the beer's average rating
    const beer = await Beer.findById(rating.beer);
    if (!beer) {
      return res.status(404).json({ message: "Beer not found" });
    }
    beer.averageRating = averageRating;
    await beer.save();

    res.status(200).json({ message: "Rating deleted successfully." });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to delete rating", error: error.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};

// Fetch the user's ratings for a specific beer or all ratings if no beerId is provided
export const getUserRatingsForBeer = async (req: Request, res: Response) => {
  const { beerId } = req.params; // Get the beerId from request parameters
  const userId = req.user?.id; // Assuming user ID is stored in req.user after authentication

  try {
    const ratings = beerId
      ? await Rating.find({ beer: beerId, user: userId }, null, { lean: true })
      : await Rating.find({ user: userId }, null, { lean: true });

    res.status(200).json(ratings);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Failed to fetch ratings",
        error: error.message,
      });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};

// Fetch all beers that a user has not rated
export const getUnratedBeers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not specified
  const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page if not specified
  const userId = req.user?.id; // Assuming user ID is stored in req.user after authentication

  try {
    // Find all beers that the user has not rated
    const unratedBeers = await Beer.paginate(
      { _id: { $not: { $in: await Rating.find({ user: userId }, '_id beer').distinct('beer') } } },
      {
        page,
        limit,
        sort: { name: -1 }, // Sort by name in descending order
        populate: [
          { path: 'tasting', model: 'Tasting' },
          {
            path: 'reviews',
            model: 'Rating',
            populate: {
              path: 'user', // Populate the user field within reviews
              model: 'User',
              select: 'username role', // Specify which fields to return
            },
          },
        ],
      },
    );

    // Return the list of unrated beers
    return res.status(200).json(unratedBeers);
  } catch (error) {
    console.error('Error fetching unrated beers:', error);
    return res.status(500).json({ message: 'Server error', error });
  }

}

// Fetch all beers that a user has rated
export const getRatedBeers = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1; // Default to page 1 if not specified
  const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page if not specified
  const userId = req.user?.id; // Assuming user ID is stored in req.user after authentication

  try {
    // Find all beers that the user has rated
    const ratedBeers = await Beer.paginate(
      { _id: { $in: await Rating.find({ user: userId }, '_id beer').distinct('beer') } },
      {
        page,
        limit,
        sort: { averageRating: 1 }, // Sort by name in ascending order
        populate: [
          { path: 'tasting', model: 'Tasting' },
          {
            path: 'reviews',
            model: 'Rating',
            populate: {
              path: 'user', // Populate the user field within reviews
              model: 'User',
              select: 'username role', // Specify which fields to return
            },
          },
        ],
      },
    );

    // Return the list of rated beers
    return res.status(200).json(ratedBeers);
  } catch (error) {
    console.error('Error fetching rated beers:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

