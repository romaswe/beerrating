import express from "express";
import {
  getBeers,
  getBeerWithRatings,
  createBeer,
  getBeersByStyle,
  updateBeer,
  deleteBeer,
} from "../controllers/beerController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").get(getBeers).post(protect, createBeer);
router.route("/:id").get(getBeerWithRatings);
router.get("/type/:style", getBeersByStyle);
router.put("/:id", protect, updateBeer); // TODO: Test this more how updateing works with incomplete fields
router.delete("/:id", protect, deleteBeer); // TODO: Add protect so only admins can delete beers

export default router;
