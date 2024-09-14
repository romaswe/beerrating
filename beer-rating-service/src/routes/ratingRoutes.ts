import express from "express";
import {
  addRating,
  updateRating,
  deleteRating,
  getUserRatingsForBeer,
  getUnratedBeers,
  getRatedBeers,
} from "../controllers/ratingController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, addRating);
router.put("/:ratingId", protect, updateRating);
router.delete("/:ratingId", protect, deleteRating);
router.get("/user-ratings/:beerId?", protect, getUserRatingsForBeer);
router.get("/unrated", protect, getUnratedBeers);
router.get("/rated", protect, getRatedBeers);

export default router;
