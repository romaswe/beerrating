import express from 'express';
import {
    getBeers,
    getBeerWithRatings,
    createBeer,
} from '../controllers/beerController';

const router = express.Router();

router.route('/').get(getBeers).post(createBeer);
router.route('/:id').get(getBeerWithRatings);

export default router;
