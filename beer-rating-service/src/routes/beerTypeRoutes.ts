import express from "express";
import { addBeerType, deleteBeerType, getBeerTypes } from "../controllers/beerTypeController";
import { protectAdmin } from "../middleware/authMiddleware";

const router = express.Router();
// Route to get all beer types
router.get('/', getBeerTypes);

// Route to add a new beer type
router.post('/', protectAdmin, addBeerType);

// Route to delete a beer type by ID
router.delete('/:id', protectAdmin, deleteBeerType);

export default router;
