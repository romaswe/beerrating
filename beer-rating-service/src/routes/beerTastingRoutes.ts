import express from 'express';
import {
    getTastings,
    createTasting,
    deleteTasting,
    addBeerToTasting,
    addRating,
    removeBeerFromTasting,
    updateTasting
} from '../controllers/tastingController'; // Update the path according to your file structure
import { protect, protectAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getTastings);
router.post('/', protect, createTasting);
router.delete('/:tastingId', protectAdmin, deleteTasting);
router.put('/:tastingId', protectAdmin, updateTasting);
router.post('/:tastingId/beers/:beerId', protect, addBeerToTasting);
router.delete('/:tastingId/beers/:beerId', protect, removeBeerFromTasting);
router.post('/:tastingId/rate', protect, addRating);

export default router;
