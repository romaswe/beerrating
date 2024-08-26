import express from "express";
import {
  addRating,
  updateRating,
  deleteRating,
} from "../controllers/ratingController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, addRating);
router.put("/:beerId/ratings/:ratingId", protect, updateRating);
router.delete("/:beerId/ratings/:ratingId", protect, deleteRating);
// TODO: Create a delete endpoint for admins that is not validated that we are the creator

export default router;
