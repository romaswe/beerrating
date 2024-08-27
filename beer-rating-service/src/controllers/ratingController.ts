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

    await rating.save();

    // Recalculate the average rating
    const allRatings = await Rating.find({ beer: beerId });
    const averageRating =
      allRatings.reduce((acc, r) => acc + r.score, 0) / allRatings.length;

    // Update the beer's average rating
    beer.averageRating = averageRating;
    await beer.save();

    res.status(201).json(rating);
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

    // Update the rating
    rating.score = score;
    rating.comment = comment;

    // Save the updated rating
    await rating.save();

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

  console.log(ratingId);

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
