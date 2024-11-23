import type { Beer } from "./Beer";

export interface Stats {
    daysMember: number;
    username: string;
    totalBeersRated: number;
    averageRating: number;
    averageRatingAllUsers: number;
    topTenBeers: Beer[];
    topBeerTypes: TopBeerType[];
}

export interface TopBeerType {
    beerType: string;
    userCount: number;
    totalCount: number;
    averageRating: number;
    totalAverageRating: number;
}

