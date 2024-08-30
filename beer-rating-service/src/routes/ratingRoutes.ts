import express from "express";
import {
  addRating,
  updateRating,
  deleteRating,
  getUserRatingsForBeer,
} from "../controllers/ratingController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, addRating);
router.put("/:ratingId", protect, updateRating);
router.delete("/:ratingId", protect, deleteRating);
router.get("/user-ratings/:beerId?", protect, getUserRatingsForBeer);
// TODO: Fetch all your ratings
// TODO: Create a delete endpoint for admins that is not validated that we are the creator

export default router;
