import express from "express";
import { protect, protectAdmin } from "../middleware/authMiddleware";
import { addTastingBeer, getTastingBeers, getTastingBeerById, updateTastingBeer, deleteTastingBeer } from "../controllers/tastingBeerController";

const router = express.Router();

router.post("/", protect, addTastingBeer);
router.get("/", protect, getTastingBeers);
router.get("/:id", protect, getTastingBeerById);
router.put("/:id", protect, updateTastingBeer);
router.delete("/:id", protectAdmin, deleteTastingBeer);
export default router;