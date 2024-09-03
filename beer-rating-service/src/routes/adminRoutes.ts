import express from "express";
import { protectAdmin } from "../middleware/authMiddleware";
import { getAllUsers, updateUserRole } from "../controllers/adminController";

const router = express.Router();


router.get('/getUsers', protectAdmin, getAllUsers);
router.put('/:userId/role', protectAdmin, updateUserRole);
export default router;
