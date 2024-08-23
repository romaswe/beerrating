"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const beerController_1 = require("../controllers/beerController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/').get(authMiddleware_1.protect, beerController_1.getBeers).post(authMiddleware_1.protect, beerController_1.createBeer);
router.route('/:id').put(authMiddleware_1.protect, beerController_1.updateBeer).delete(authMiddleware_1.protect, beerController_1.deleteBeer);
exports.default = router;
