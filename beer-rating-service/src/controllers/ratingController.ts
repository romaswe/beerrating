import { Request, Response } from "express";
import Beer from "../models/beer";
import Rating from "../models/rating";

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
