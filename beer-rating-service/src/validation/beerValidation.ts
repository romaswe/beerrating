import { z } from 'zod';

export const beerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.string().min(1, 'Type is required'),
    rating: z.number().min(0).max(5, 'Rating must be between 0 and 5'),
});

export type BeerInput = z.infer<typeof beerSchema>;
