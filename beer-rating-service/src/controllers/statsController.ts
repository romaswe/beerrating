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
        // This is done by grouping all user ratings and calculating the average score
        // The result is an array with one element, which is an object with the averageRating field
        // We then extract the averageRating field from this object, or use 0 if it does not exist
        const averageRating = (await Rating.aggregate([
            { $match: { user: user._id } }, // Filter ratings by user
            { $group: { _id: null, averageRating: { $avg: "$score" } } }, // Group and calculate average score
        ]))?.[0]?.averageRating || 0;

        // Calculate the average rating given by all users
        // This is done by grouping all user ratings and calculating the average score
        // The result is an array with one element, which is an object with the averageRating field
        // We then extract the averageRating field from this object, or use 0 if it does not exist
        const averageRatingAllUsers = (await Rating.aggregate([
            { $group: { _id: null, averageRating: { $avg: "$score" } } }, // Group and calculate average score
        ]))?.[0]?.averageRating || 0;

        const topBeerTypes = await Rating.aggregate([
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
                $facet: {
                    // User-specific ratings grouped by beer type
                    userRatings: [
                        { $match: { user: user._id } }, // Filter ratings by user
                        {
                            $group: {
                                _id: "$beerInfo.type", // Group by beer type
                                count: { $sum: 1 }, // Count occurrences of each type
                                averageRating: { $avg: "$score" }, // Calculate average score for user
                            },
                        },
                    ],

                    // Total ratings grouped by beer type
                    totalRatings: [
                        {
                            $group: {
                                _id: "$beerInfo.type", // Group by beer type
                                count: { $sum: 1 }, // Count occurrences of each type
                                averageRating: { $avg: "$score" }, // Calculate average score across all users
                            },
                        },
                    ],

                    // Total beers grouped by beer type (include all beers, rated or not)
                    totalBeers: [
                        {
                            $lookup: {
                                from: "beers",
                                pipeline: [
                                    { $unwind: "$type" }, // Flatten type array
                                    {
                                        $group: {
                                            _id: "$type", // Group by beer type
                                            totalCount: { $sum: 1 }, // Count all beers in each type
                                        },
                                    },
                                    {
                                        $project: {
                                            _id: 0, // Exclude _id from the result
                                            type: "$_id", // Rename _id to type for matching later
                                            totalCount: 1, // Include totalCount
                                        },
                                    },
                                ],
                                as: "totalBeers",
                            },
                        },
                    ],
                },
            },

            // Combine all facets into a unified result
            {
                $project: {
                    userRatings: 1,
                    filteredTotalRatings: {
                        $filter: {
                            input: "$totalRatings",
                            as: "totalResult",
                            cond: {
                                $in: ["$$totalResult._id", { $map: { input: "$userRatings", as: "userResult", in: "$$userResult._id" } }],
                            },
                        },
                    },
                    totalBeers: { $arrayElemAt: ["$totalBeers.totalBeers", 0] }, // Extract totalBeers array
                },
            },

            // Merge userRatings, totalRatings, and totalBeers
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
                                                        input: "$totalBeers",
                                                        as: "beerResult",
                                                        cond: { $eq: ["$$beerResult.type", "$$userResult._id"] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                        { totalCount: 0 }, // Default to 0 if no match
                                    ],
                                },
                                totalAverageRating: {
                                    $ifNull: [
                                        {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$filteredTotalRatings",
                                                        as: "totalResult",
                                                        cond: { $eq: ["$$totalResult._id", "$$userResult._id"] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                        { averageRating: 0 }, // Default to 0 if no match
                                    ],
                                },
                            },
                        },
                    },
                },
            },

            // Flatten and sort combined results
            { $unwind: "$combinedResults" }, // Flatten the combinedResults array
            {
                $sort: {
                    "combinedResults.userCount": -1, // Primary sort by userCount (descending)
                    "combinedResults.userAverageRating": -1, // Secondary sort by userAverageRating (descending)
                },
            },
            {
                $group: {
                    _id: null,
                    combinedResults: { $push: "$combinedResults" }, // Rebuild the array after sorting
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
            topTenBeers: topTenBeers.map(beer => beer.beer),
            topBeerTypes: topBeerTypes[0]?.combinedResults?.length
                ? topBeerTypes[0].combinedResults.map((type: { type: any; userCount: any; totalCount: any; userAverageRating: any; totalAverageRating: any; }) => ({
                    beerType: type.type,
                    userCount: type.userCount,
                    totalCount: type.totalCount.totalCount || 0, // Default to 0 if null
                    averageRating: Math.round((type.userAverageRating || 0) * 100) / 100, // Handle null with default
                    totalAverageRating: Math.round((type.totalAverageRating || 0) * 100) / 100, // Handle null with default
                }))
                : [],
        };

        res.status(201).json(stats);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};





