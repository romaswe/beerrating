import express from 'express';
import {
    getBeers,
    createBeer,
    updateBeer,
    deleteBeer,
} from '../controllers/beerController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getBeers).post(protect, createBeer);
router.route('/:id').put(protect, updateBeer).delete(protect, deleteBeer);

export default router;
