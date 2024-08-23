"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBeer = exports.updateBeer = exports.createBeer = exports.getBeers = void 0;
const beer_1 = __importDefault(require("../models/beer"));
const beerValidation_1 = require("../validation/beerValidation");
const getBeers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const beers = yield beer_1.default.find({ user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
        res.json(beers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getBeers = getBeers;
const createBeer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const beerInput = beerValidation_1.beerSchema.parse(req.body);
        const beer = new beer_1.default(Object.assign(Object.assign({}, beerInput), { user: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }));
        const savedBeer = yield beer.save();
        res.status(201).json(savedBeer);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(400).json({ message: 'Invalid data' });
        }
    }
});
exports.createBeer = createBeer;
const updateBeer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    try {
        const beerInput = beerValidation_1.beerSchema.parse(req.body);
        const beer = yield beer_1.default.findById(id);
        if (!beer) {
            return res.status(404).json({ message: 'Beer not found' });
        }
        if (beer.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        beer.name = beerInput.name;
        beer.type = beerInput.type;
        beer.rating = beerInput.rating;
        const updatedBeer = yield beer.save();
        res.json(updatedBeer);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(400).json({ message: 'Invalid data' });
        }
    }
});
exports.updateBeer = updateBeer;
const deleteBeer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    try {
        const beer = yield beer_1.default.findById(id);
        if (!beer) {
            return res.status(404).json({ message: 'Beer not found' });
        }
        if (beer.user.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        yield beer_1.default.deleteOne({ _id: id }); // Use deleteOne instead of remove
        res.json({ message: 'Beer removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteBeer = deleteBeer;
