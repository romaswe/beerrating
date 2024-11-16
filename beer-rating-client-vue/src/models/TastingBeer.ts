export interface TastingBeerDoc {
    docs: TastingBeer[];
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

export interface TastingBeer {
    _id?: string;
    name: string;
    type?: string[];
    link: string;
    comment?: string;
    createdAt?: Date;
    updatedAt?: Date;
    __v?: number;
}
