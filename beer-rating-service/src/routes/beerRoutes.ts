import express from 'express';
import {
    getBeers,
    getBeerWithRatings,
    createBeer,
} from '../controllers/beerController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(getBeers).post(protect, createBeer);
router.route('/:id').get(getBeerWithRatings);

export default router;
