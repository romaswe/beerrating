import express from "express";
import { getBeersFromSheet, clearCache } from "../controllers/sheetController";

const router = express.Router();

router.get("/beers-from-sheet", getBeersFromSheet);
router.post("/clear-cache", clearCache);

export default router;
