"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beerSchema = void 0;
const zod_1 = require("zod");
exports.beerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    type: zod_1.z.string().min(1, 'Type is required'),
    rating: zod_1.z.number().min(0).max(5, 'Rating must be between 0 and 5'),
});
