import express from 'express';
import { addRating } from '../controllers/ratingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, addRating);

export default router;
