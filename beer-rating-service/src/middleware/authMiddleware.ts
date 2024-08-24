import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';

interface JwtPayload {
    id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    // Check if the request has a token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the authorization header
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

            // Fetch the user associated with the token, cast to IUser or null
            const user = await User.findById(decoded.id).select('-password') as IUser | null;

            // If no user found, respond with unauthorized
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Assign the found user to the request object
            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};