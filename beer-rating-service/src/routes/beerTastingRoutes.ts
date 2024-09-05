import express from 'express';
import {
    getTastings,
    getTastingById,
    createTasting,
    updateTasting,
    deleteTasting,
} from '../controllers/tastingController'; // Update the path according to your file structure
import { protect, protectAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getTastings);
router.get('/:id', protect, getTastingById);
router.post('/', protect, createTasting);
router.put('/:id', protectAdmin, updateTasting);
router.delete('/:id', protectAdmin, deleteTasting);

export default router;
