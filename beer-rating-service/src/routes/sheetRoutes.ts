import express from 'express';
import { getBeersFromSheet } from '../controllers/sheetController';

const router = express.Router();

router.get('/beers-from-sheet', getBeersFromSheet);

export default router;
