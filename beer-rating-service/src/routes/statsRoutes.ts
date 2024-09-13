import { getUserStats } from "../controllers/statsController";
import { protect } from "../middleware/authMiddleware";
import express from "express";

const router = express.Router();

router.get("/user-stats", protect, getUserStats);

export default router;