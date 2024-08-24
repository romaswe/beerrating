import express, { Application } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import beerRoutes from './routes/beerRoutes';

dotenv.config();

const app: Application = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/beers', beerRoutes);

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI!)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((error) => {
        console.error('Connection error', error.message);
    });
