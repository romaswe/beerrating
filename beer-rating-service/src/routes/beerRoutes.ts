import express from "express";
import {
  getBeers,
  getBeerWithRatings,
  createBeer,
  getBeersByStyle,
  updateBeer,
  deleteBeer,
} from "../controllers/beerController";
import { protect, protectAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").get(getBeers).post(protect, createBeer);
router.route("/:id").get(getBeerWithRatings);
router.get("/type/:style", getBeersByStyle);
router.put("/:id", protect, updateBeer);
router.delete("/:id", protectAdmin, deleteBeer);

export default router;
