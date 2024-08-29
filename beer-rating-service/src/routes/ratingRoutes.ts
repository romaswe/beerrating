import express from "express";
import {
  addRating,
  updateRating,
  deleteRating,
} from "../controllers/ratingController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, addRating);
router.put("/:ratingId", protect, updateRating);
router.delete("/:ratingId", protect, deleteRating);
// TODO: Create endpoint to fetch your rating for spesific beer
// TODO: Fetch all your ratings
// TODO: Create a delete endpoint for admins that is not validated that we are the creator

export default router;
