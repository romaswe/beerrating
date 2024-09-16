import { Request, Response } from "express";
import User from "../models/user";
import Rating from "../models/rating";

export const getUserStats = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate days since created
        const daysSinceCreated = user.createdAt
            ? Math.ceil((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000))
            : 0;

        // Fetch top ten beers this user has rated
        const topTenBeers = await Rating
            .find({ user: user._id })
            .sort({ score: -1 })
            .limit(10)
            .populate([
                {
                    path: 'beer', // Populate beer details
                    populate: [
                        {
                            path: 'tasting', // Populate the tasting field within beer
                            model: 'Tasting',
                        },
                        {
                            path: 'reviews', // Populate the reviews field within beer
                            model: 'Rating',
                            populate: {
                                path: 'user', // Populate the user field within reviews
                                model: 'User',
                                select: 'username role', // Specify which fields to return
                                match: { deletedAt: null, _id: { $ne: null } }, // Exclude deleted users
                            },
                        },
                    ],
                },
            ]);

        // Count the number of beers this user have rated
        const totalBeersRated = await Rating.countDocuments({ user: user._id });

        // Calculate the average rating
        const averageRating = (await Rating.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: null, averageRating: { $avg: "$score" } } },
        ]))?.[0]?.averageRating || 0;

        const stats = {
            daysMember: daysSinceCreated,
            username: user.username,
            totalBeersRated,
            averageRating: Math.round(averageRating * 100) / 100,
            topTenBeers: topTenBeers.map(beer => beer.beer),
        };
        res.status(201).json(stats);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
}



