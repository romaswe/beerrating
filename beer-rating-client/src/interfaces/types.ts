// types.ts

export interface APIResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

export interface BeerObj {
  name: string;
  rating: number;
  style: string;
}

export interface StyleObj {
  style: string;
  count: number;
  topBeer?: BeerObj;
  avrageStyleRating?: number;
}
