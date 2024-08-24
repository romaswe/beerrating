import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes';
import beerRoutes from './routes/beerRoutes';
import ratingRoutes from './routes/ratingRoutes';
import sheetRoutes from './routes/sheetRoutes';
import helmet from "helmet";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(helmet());

app.use('/api/auth', authRoutes);
app.use('/api/beers', beerRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/sheets', sheetRoutes);

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI!)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => {
        console.error('Connection error', error.message);
    }).finally(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    });