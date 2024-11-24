// Models for Google sheets

export interface BeerSheet {
  headers: string[]
  data: Array<string[]>
  styleArray: Array<Array<StyleArrayClass>>
}

export interface StyleArrayClass {
  style: string
  count: number
  topBeer: TopBeer
  avrageStyleRating: number
}

export interface TopBeer {
  name: string
  rating: number
  style: string
}

// Models from backend

export interface BeerModel {
  docs: Beer[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: null;
  nextPage: null;
  validBeerTypes: string[];
  allBreweries: string[];
}

export interface Beer {
  _id?: string;
  name: string;
  type?: string[];
  averageRating: number;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
  abv?: number;
  reviews?: Review[];
  tasting?: any[];
  brewery?: string;
  matchedSites?: MatchedBeerSites;
}

export interface MatchedBeerSites {
  untappd?: MatchedUntappd;
  systembolaget?: MatchedSystembolaget;
  ratebeer?: MatchedRatebeer;
}

export interface MatchedSystembolaget {
  url?: string;
  id?: string;
  // In the feature fetch information from the site and store it in the database
}

export interface MatchedUntappd {
  url?: string;
  id?: string;
  // In the feature fetch information from the site and store it in the database
}

export interface MatchedRatebeer {
  url?: string;
  id?: string;
  // In the feature fetch information from the site and store it in the database
}

export interface Review {
  _id: string;
  beer: string;
  user: User;
  score: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface User {
  _id: string;
  username: string;
  role: string;
}
