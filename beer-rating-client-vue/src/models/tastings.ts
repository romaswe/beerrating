export interface TastingModel {
    docs: Tasting[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage: null;
    nextPage: null;
}

export interface Tasting {
    _id: string;
    name: string;
    description: string;
    beers: string[];
    users: any[];
    reviews: Review[];
    createdAt: Date;
    updatedAt: Date;
    __v: number;
    averageBeerRating: number;
}

export interface Review {
    user: string;
    score: number;
    comment: string;
    _id: string;
}
