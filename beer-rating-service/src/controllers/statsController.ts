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
                    path: "beer", // Populate beer details
                    populate: [
                        { path: "tasting", model: "Tasting" },
                        {
                            path: "reviews",
                            model: "Rating",
                            populate: {
                                path: "user",
                                model: "User",
                                select: "username role",
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

        // Calculate the average rating given by all users
        const averageRatingAllUsers = (await Rating.aggregate([
            { $group: { _id: null, averageRating: { $avg: "$score" } } },
        ]))?.[0]?.averageRating || 0;

        // Fetch the top beer styles rated by the user and calculate stats
        const topBeerTypes = await Rating.aggregate([
            {
                $lookup: {
                    from: "beers", // Collection name for beers
                    localField: "beer",
                    foreignField: "_id",
                    as: "beerInfo",
                },
            },
            { $unwind: "$beerInfo" }, // Flatten the beerInfo array
            { $unwind: "$beerInfo.type" }, // Flatten the beer type array
            {
                $facet: {
                    userRatings: [
                        { $match: { user: user._id } },
                        {
                            $group: {
                                _id: "$beerInfo.type",
                                count: { $sum: 1 },
                                averageRating: { $avg: "$score" },
                            },
                        },
                    ],
                    totalRatings: [
                        {
                            $group: {
                                _id: "$beerInfo.type",
                                count: { $sum: 1 },
                                averageRating: { $avg: "$score" },
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    userRatings: 1,
                    filteredTotalRatings: {
                        $filter: {
                            input: "$totalRatings",
                            as: "totalResult",
                            cond: {
                                $in: [
                                    "$$totalResult._id",
                                    {
                                        $map: {
                                            input: "$userRatings",
                                            as: "userResult",
                                            in: "$$userResult._id",
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    combinedResults: {
                        $map: {
                            input: "$userRatings",
                            as: "userResult",
                            in: {
                                type: "$$userResult._id",
                                userCount: "$$userResult.count",
                                userAverageRating: "$$userResult.averageRating",
                                totalCount: {
                                    $ifNull: [
                                        {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$filteredTotalRatings",
                                                        as: "totalResult",
                                                        cond: {
                                                            $eq: ["$$totalResult._id", "$$userResult._id"],
                                                        },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                        { count: 0, averageRating: 0 },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    combinedResults: {
                        $map: {
                            input: "$combinedResults",
                            as: "result",
                            in: {
                                type: "$$result.type",
                                userCount: "$$result.userCount",
                                userAverageRating: "$$result.userAverageRating",
                                totalCount: "$$result.totalCount.count",
                                totalAverageRating: {
                                    $ifNull: ["$$result.totalCount.averageRating", 0],
                                },
                            },
                        },
                    },
                },
            },
            { $unwind: "$combinedResults" },
            {
                $sort: {
                    "combinedResults.userCount": -1,
                    "combinedResults.userAverageRating": -1,
                },
            },
            {
                $group: {
                    _id: null,
                    combinedResults: { $push: "$combinedResults" },
                },
            },
        ]);

        // Prepare the stats to return
        const stats = {
            daysMember: daysSinceCreated,
            username: user.username,
            totalBeersRated,
            averageRating: Math.round(averageRating * 100) / 100,
            averageRatingAllUsers: Math.round(averageRatingAllUsers * 100) / 100,
            topTenBeers: topTenBeers.map((beer) => beer.beer),
            topBeerTypes: topBeerTypes[0]?.combinedResults?.length
                ? topBeerTypes[0].combinedResults.map((type: { type: any; userCount: any; totalCount: any; userAverageRating: any; totalAverageRating: any }) => ({
                    beerType: type.type,
                    userCount: type.userCount,
                    totalCount: type.totalCount || 0,
                    averageRating: Math.round((type.userAverageRating || 0) * 100) / 100,
                    totalAverageRating: Math.round((type.totalAverageRating || 0) * 100) / 100,
                }))
                : [],
        };

        res.status(201).json(stats);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
