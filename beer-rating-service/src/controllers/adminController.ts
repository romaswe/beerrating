import { Request, Response } from "express";
import User, { IUser, roles } from "../models/user";

// Fetch all users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1; // Default to page 1 if not specified
        const limit = parseInt(req.query.limit as string, 10) || 10; // Default to 10 items per page if not specified

        // Use mongoose-paginate-v2 to paginate users and exclude password
        const users = await User.paginate(
            {},
            {
                page,
                limit,
                select: "-password", // Exclude password field
                sort: { username: 1 }, // Sort by username in ascending order
            }
        );

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: (error as Error).message });
    }
};

// Update a user's role
export const updateUserRole = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate if provided role is valid
    if (!Object.values(roles).includes(role)) {
        return res.status(400).json({
            message: `Invalid role provided. Valid roles are: ${Object.values(roles).join(", ")}.`,
        });
    }

    try {
        // Find user by ID and update the role
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, runValidators: true, select: "-password" } // Exclude password field
        );

        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found.` });
        }

        res.status(200).json({ message: `User role updated successfully to ${role}.`, user });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user role", error: (error as Error).message });
    }
};