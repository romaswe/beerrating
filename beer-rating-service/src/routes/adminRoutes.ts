import express from "express";
import { protectAdmin } from "../middleware/authMiddleware";
import { getAllUsers, updateUserRole, adminDeleteRating } from "../controllers/adminController";

const router = express.Router();


router.get('/getUsers', protectAdmin, getAllUsers);
router.put('/:userId/role', protectAdmin, updateUserRole);
router.delete("/user-ratings/:ratingId", protectAdmin, adminDeleteRating);
export default router;
