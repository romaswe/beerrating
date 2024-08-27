import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";

// Utility function to get JWT secret
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return secret;
};

// Function to generate a JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, getJwtSecret(), { expiresIn: "30d" });
};

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ username, password });

    if (user) {
      res.status(201).json({
        id: user.id,
        username: user.username,
        role: user.role,
        token: generateToken(user.id.toString()), // Ensure user._id is a string
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Log in a user
export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = (await User.findOne({ username })) as IUser;

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        token: generateToken(user.id.toString()), // Ensure user.id is a string
      });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
