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

export interface BeerSheet {
  headers: string[];
  data: Array<string[]>;
  styleArray: Array<Array<StyleArrayClass>>;
}

export interface StyleArrayClass {
  style: string;
  count: number;
  topBeer: TopBeer;
  avrageStyleRating: number;
}

export interface TopBeer {
  name: string;
  rating: number;
  style: string;
}
