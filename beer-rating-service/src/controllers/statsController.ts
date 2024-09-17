import { Request, Response } from "express";
import User from "../models/user";
import Rating from "../models/rating";

export const getUserStats = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate days since account creation
        const daysSinceCreated = user.createdAt
            ? Math.ceil((Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000))
            : 0;

        // Fetch top ten beers the user has rated
        const topTenBeers = await Rating
            .find({ user: user._id })
            .sort({ score: -1 })
            .limit(10)
            .populate([
                {
                    path: 'beer', // Populate beer details
                    populate: [
                        {
                            path: 'tasting', // Populate tasting field within beer
                            model: 'Tasting',
                        },
                        {
                            path: 'reviews', // Populate reviews field within beer
                            model: 'Rating',
                            populate: {
                                path: 'user', // Populate user field within reviews
                                model: 'User',
                                select: 'username role', // Specify fields to return
                                match: { deletedAt: null, _id: { $ne: null } }, // Exclude deleted users
                            },
                        },
                    ],
                },
            ]);

        // Count the number of beers this user has rated
        const totalBeersRated = await Rating.countDocuments({ user: user._id });

        // Calculate the average rating given by the user
        const averageRating = (await Rating.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: null, averageRating: { $avg: "$score" } } },
        ]))?.[0]?.averageRating || 0;

        // Fetch the top 10 beer types the user has rated, along with count and average score
        const topBeerTypes = await Rating.aggregate([
            { $match: { user: user._id } }, // Filter ratings by user
            {
                $lookup: {
                    from: "beers", // Collection name of beers
                    localField: "beer",
                    foreignField: "_id",
                    as: "beerInfo",
                },
            },
            { $unwind: "$beerInfo" }, // Flatten the beer info array
            { $unwind: "$beerInfo.type" }, // Flatten the beer type array
            {
                $group: {
                    _id: "$beerInfo.type", // Group by beer type
                    count: { $sum: 1 }, // Count occurrences of each type
                    averageRating: { $avg: "$score" }, // Calculate average score for each type
                },
            },
            { $sort: { count: -1 } }, // Sort by count in descending order
        ]);

        // Prepare the stats to return
        const stats = {
            daysMember: daysSinceCreated,
            username: user.username,
            totalBeersRated,
            averageRating: Math.round(averageRating * 100) / 100,
            topTenBeers: topTenBeers.map(beer => beer.beer),
            topBeerTypes: topBeerTypes.map(type => ({
                beerType: type._id,
                count: type.count,
                averageRating: Math.round(type.averageRating * 100) / 100, // Round to 2 decimal places
            })),
        };

        res.status(201).json(stats);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};





