import type { Beer } from "./Beer";

export interface Stats {
    daysMember: number;
    username: string;
    totalBeersRated: number;
    averageRating: number;
    topTenBeers: Beer[];
}

